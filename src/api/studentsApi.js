import { supabase } from '../supabaseClient';

const TABLE_NAME = 'Форма списків';


export async function addStudent(newStudentData) {
    // Вставляємо нові дані. newStudentData - це об'єкт,
    // що містить child_name, gender, birth_date, тощо.
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([newStudentData])
        .select(); // Важливо: повертаємо доданий об'єкт

    if (error) {
        console.error('Помилка додавання учня:', error);
        return { success: false, data: null };
    }
    // Повертаємо перший елемент масиву (доданий об'єкт)
    return { success: true, data: data[0] };
}

// =======================================================
// R (Read): Функція для отримання всіх учнів
// =======================================================
export async function getStudents() {
    // В цьому запиті ми отримуємо всі стовпці з таблиці 'students_info'
    // і сортуємо їх за ім'ям (child_name)
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, child_name, gender, birth_date, address, parent_name, parent_phone')
        .order('child_name', { ascending: true }); // Сортування за ім'ям

    if (error) {
        console.error('Помилка завантаження учнів:', error);
        return [];
    }
    return data;
}

// =======================================================
// D (Delete): Функція для видалення учня
// =======================================================
export async function deleteStudent(id) {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id); // Видалити рядок, де 'id' дорівнює переданому значенню

    if (error) {
        console.error('Помилка видалення учня:', error);
        return false;
    }
    return true; // Успішно
}