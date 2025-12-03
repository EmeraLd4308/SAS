import { supabase } from '../client/supabaseClient'

const TABLE_NAME = 'students_info';
function buildQuery(sortBy, sortAscending, searchTerm, genderFilter, dateFrom, dateTo) {
    let query = supabase.from(TABLE_NAME).select('*');
    if (searchTerm) {
        query = query.or(`child_name.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }
    if (genderFilter && genderFilter !== 'all') {
        query = query.eq('gender', genderFilter);
    }
    if (dateFrom) {
        query = query.gte('birth_date', dateFrom);
    }
    if (dateTo) {
        query = query.lte('birth_date', dateTo);
    }
    if (sortBy) {
        query = query.order(sortBy, { ascending: sortAscending });
    }
    return query;
}

export async function getStudents(sortBy = 'seq_number', sortAscending = true, searchTerm = '', genderFilter = '', dateFrom = null, dateTo = null) {
    try {
        const query = buildQuery(sortBy, sortAscending, searchTerm, genderFilter, dateFrom, dateTo);
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
