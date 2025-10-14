export const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g, '');
};

export const formatCPF = (value: string): string => {
    const numbers = removeNonNumeric(value);
    return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatCNPJ = (value: string): string => {
    const numbers = removeNonNumeric(value);
    return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
    const numbers = removeNonNumeric(cpf);

    if (numbers.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(numbers)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;

    return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
    const numbers = removeNonNumeric(cnpj);

    if (numbers.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(numbers)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(numbers[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(numbers[12])) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(numbers[i]) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(numbers[13])) return false;

    return true;
};

export const validateDocument = (document: string): {
    isValid: boolean;
    type: 'CPF' | 'CNPJ' | 'UNKNOWN';
    formatted: string;
} => {
    const numbers = removeNonNumeric(document);

    if (numbers.length === 11) {
        return {
            isValid: validateCPF(document),
            type: 'CPF',
            formatted: formatCPF(document)
        };
    } else if (numbers.length === 14) {
        return {
            isValid: validateCNPJ(document),
            type: 'CNPJ',
            formatted: formatCNPJ(document)
        };
    }

    return {
        isValid: false,
        type: 'UNKNOWN',
        formatted: document
    };
};
