import { supabase } from '../client/supabaseClient';
import * as XLSX from 'xlsx';

export async function exportToExcel(filters = {}) {
    try {
        let query = supabase.from('students_info').select('*');

        if (filters.searchTerm) {
            query = query.or(
                `child_name.ilike.%${filters.searchTerm}%,parent_name.ilike.%${filters.searchTerm}%,address.ilike.%${filters.searchTerm}%`
            );
        }

        if (filters.genderFilter) {
            query = query.eq('gender', filters.genderFilter);
        }

        if (filters.dateFrom) {
            query = query.gte('birth_date', filters.dateFrom);
        }

        if (filters.dateTo) {
            query = query.lte('birth_date', filters.dateTo);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Помилка отримання даних для експорту:', error);
            return { success: false, error };
        }

        if (!data || data.length === 0) {
            return { success: false, error: 'Немає даних для експорту' };
        }

        const excelData = data.map(student => ({
            'ID': student.id || '',
            'ПІБ Дитини': student.child_name || '',
            'Стать': student.gender || '',
            'Дата народження': student.birth_date || '',
            'Адреса': student.address || '',
            'ПІБ Батьків': student.parent_name || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Учні ВОКС");

        const colWidths = [
            { wch: 8 },  // ID
            { wch: 25 }, // ПІБ Дитини
            { wch: 8 },  // Стать
            { wch: 15 }, // Дата народження
            { wch: 30 }, // Адреса
            { wch: 25 }, // ПІБ Батьків
        ];
        worksheet['!cols'] = colWidths;

        const fileName = `Діти_ВОКС_${new Date().toLocaleDateString('uk-UA')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        return {
            success: true,
            count: data.length,
            fileName: fileName
        };
    } catch (error) {
        console.error('Непередбачена помилка при експорті:', error);
        return { success: false, error };
    }
}
