import { createTheme } from '@mantine/core';

export const theme = createTheme({
    fontFamily: 'Inter',
    fontSizes: {
        xl: '3rem',
        lg: '2rem',
        md: '1.5rem',
        sm: '1.2rem',
        xs: '1rem',
    },
    headings: {
        fontFamily: 'Inter',
        sizes: {
            h1: { fontSize: '4rem',    fontWeight: '700', lineHeight: '0.9'},
            h2: { fontSize: '2.1rem' },
            h3: { fontSize: '2rem',    fontWeight: '700' },
            h4: { fontSize: '1.25rem', fontWeight: '400' },
            h5: { fontSize: '1rem',    fontWeight: '500', lineHeight: '1.2'},
            h6: { fontSize: '0.5rem' }
        }
    },
    colors: {
        neutral: ['#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF', '#E8EADF'],
        accent: ['#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24', '#C81E24'],
        blue: ['#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4', '#9EC2F4'],
    },
    spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.25rem',
        lg: '2rem',
        xl: '3rem',
    }
});