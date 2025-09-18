import { existsSync } from 'node:fs'
import fs from 'node:fs'
import path from 'path'

import { program } from 'commander'
import XLSX from 'xlsx'

type OutputData = {
    subj_code: string
    crse_numb: number
    seq_numb: number
    course_title: string
    all_instructors: string
    room_code: number
    begin_time: number
    end_time: number
    day: string
}

program
    .requiredOption(
        '--input <path>',
        'Path to input .xlsx file',
        'input/schedule.xlsx'
    )
    .option(
        '--columns <columns>',
        'Comma-separated column letters (e.g., B,C,E,F',
        'I,K,L,O,AP,AW,AX,AZ,BM'
    )
    .option(
        '--output <path>',
        'Path to output .json file',
        'static/data/schedule.json'
    )
    .parse(process.argv)

const { input, columns, output } = program.opts<{
    input: string
    columns: string
    output: string
}>()

function trim_leading_zeros(value: string | number): number {
    const str_value = String(value)

    if (!str_value || str_value.trim() === '') return 0

    const is_negative = str_value.startsWith('-')
    const abs_value = is_negative ? str_value.slice(1) : str_value
    const trimmed = abs_value.replace(/^0+/, '') || 0

    return is_negative ? -Number(trimmed) : Number(trimmed)
}


function build_json(source_data) {
    const output_data: OutputData[] = []

    source_data.forEach((course) => {
        output_data.push({
            subj_code: course[0],
            crse_numb: parseInt(course[1]),
            seq_numb: trim_leading_zeros(course[2]),
            course_title: course[3],
            all_instructors: course[8],
            room_code: parseInt(course[7]),
            begin_time: trim_leading_zeros(course[5]),
            end_time: trim_leading_zeros(course[6]),
            day: course[4]
        })
    })

    return output_data
}

try {
    const input_path = path.resolve(input)

    if (!existsSync(input_path))
        throw new Error(`Input file not found: ${input_path}`)

    const column_letters = columns.split(',').map(col => col.trim().toUpperCase())
    const column_indices = column_letters.map(col => {
        const index = XLSX.utils.decode_col(col)

        if (index < 0) throw new Error(`Invalid column letter: ${col}`)

        return index
    })
    const workbook = XLSX.readFile(input_path)
    const sheet_name = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheet_name]

    if (!sheet) throw new Error('No sheets found in the input file')

    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
    const extracted_data = data.map(row => column_indices.map(index => row[index] ?? null))
    const filtered_data = extracted_data.filter((row, index) => {
        const priority_rooms = [242, 206, 239, 246, 247, 248, 250, 252, 345]
        const course_number = row[1]
        const room_code = row[7]
        const instructor = row[8]

        if (instructor === null || course_number === null || room_code === null) return false
        if (instructor === null || !instructor) return false

        const course_number_str = (course_number == null ? '' : String(course_number)).trim()

        if (course_number_str === '' || course_number_str === 'Crse Numb') return false
        if (isNaN(parseInt(course_number_str))) return false

        const room_code_str = (room_code == null ? '' : String(room_code)).trim()

        if (room_code_str === '') return false
        if (!priority_rooms.includes(parseInt(room_code))) return false

        if (index === 0 && room_code && course_number && instructor) return true

        return true
    })
    const output_data = build_json(filtered_data)
    const output_json_data = JSON.stringify(output_data, null, 2)

    fs.writeFileSync(output, output_json_data)

    console.log(`${output} file written successfully`)

} catch (error) {
    console.error(`Error: ${error as Error}.message`)
    process.exit(1)
}
