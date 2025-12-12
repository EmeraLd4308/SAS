import { supabase } from "../client/supabaseClient.js";

const TABLE_NAME = 'students_info';

export async function getStudents(sortBy = 'seq_number', sortAscending = true, searchTerm = '', genderFilter = '', addressFilter = '', dateFrom = null, dateTo = null, yearFilter = null) {
    try {
        let actualDateFrom = dateFrom;
        let actualDateTo = dateTo;
        if (yearFilter) {
            actualDateFrom = `${yearFilter}-01-01`;
            actualDateTo = `${yearFilter}-12-31`;
        }
        const query = buildQuery(sortBy, sortAscending, searchTerm, genderFilter, addressFilter, actualDateFrom, actualDateTo);
        const { data, error } = await query;
        if (error) {
            console.error('Помилка отримання учнів:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Непередбачена помилка в getStudents:', e);
        return [];
    }
}

function buildQuery(sortBy, sortAscending, searchTerm, genderFilter, addressFilter, dateFrom, dateTo) {
    let query = supabase.from(TABLE_NAME).select('*');
    if (searchTerm) {
        query = query.or(`child_name.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }
    if (genderFilter && genderFilter !== 'all') {
        query = query.eq('gender', genderFilter);
    }
    if (addressFilter && addressFilter !== 'all') {
        query = query.ilike('address', `%${addressFilter}%`);
    }
    if (dateFrom && dateFrom !== 'all') {
        query = query.gte('birth_date', dateFrom);
    }
    if (dateTo && dateTo !== 'all') {
        query = query.lte('birth_date', dateTo);
    }
    if (sortBy) {
        query = query.order(sortBy, { ascending: sortAscending });
    }
    return query;
}

export async function getUniqueYears() {
    try {
        const { data, error } = await supabase.from(TABLE_NAME).select('birth_date').not('birth_date', 'is', null);
        if (error) {
            console.error('Помилка отримання років:', error);
            return getDefaultYears();
        }
        if (!data || data.length === 0) {
            return getDefaultYears();
        }
        const yearsSet = new Set();
        data.forEach(student => {
            if (student.birth_date) {
                const year = new Date(student.birth_date).getFullYear();
                yearsSet.add(year);
            }
        });
        const years = Array.from(yearsSet).sort((a, b) => b - a).slice(0, 6);
        return years.length > 0 ? years : getDefaultYears();
        
    } catch (error) {
        console.error('Непередбачена помилка в getUniqueYears:', error);
        return getDefaultYears();
    }
}

function getDefaultYears() {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 6}, (_, i) => currentYear - i);
}

export async function addStudent(newStudentData) {
    try {
        const { data, error } = await supabase.from(TABLE_NAME).insert([newStudentData]).select();
        if (error) {
            console.error('Помилка додавання учня:', error);
            return { success: false, data: null, error };
        }
        return { success: true, data: data?.[0] || null };
    } catch (e) {
        console.error('Непередбачена помилка в addStudent:', e);
        return { success: false, data: null, error: e };
    }
}

export async function updateStudent(id, updatedFields) {
    try {
        const { data, error } = await supabase.from(TABLE_NAME).update(updatedFields).eq('id', id).select();
        if (error) {
            console.error('Помилка оновлення учня:', error);
            return { success: false, data: null, error };
        }
        return { success: true, data: data?.[0] || null };
    } catch (e) {
        console.error('Непередбачена помилка в updateStudent:', e);
        return { success: false, data: null, error: e };
    }
}

export async function deleteStudent(studentId) {
    try {
        const { error } = await supabase.from(TABLE_NAME).delete().eq('id', studentId);
        if (error) {
            console.error('Помилка видалення учня:', error);
            return { success: false, error };
        }
        return { success: true };
    } catch (e) {
        console.error('Непередбачена помилка в deleteStudent:', e);
        return { success: false, error: e };
    }
}
