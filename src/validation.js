import { defineRule } from 'vee-validate';

// Define the weight validation rule
defineRule("weightRule", (value) => {
    if (typeof value === "string" && !value.trim()) return true;
    const parsedValue = parseFloat(value);
    
    if (!isNaN(parsedValue)) {
        if (parsedValue >= 1 && parsedValue <= 200.0) return true;
        if (parsedValue > 200.0) {
            return "It seems unlikely that the subject's weight exceeds 200 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
        }
        if (parsedValue < 1) {
            return "It seems unlikely that the subject's weight is less than 1 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
        }
    }
    return "Invalid weight value";
});

// Define the height validation rule
defineRule("heightRule", (value) => {
    if (typeof value === "string" && !value.trim()) return true;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
        if (parsedValue >= 0.1 && parsedValue <= 3.0) return true;
        if (parsedValue > 3.0) {
            return "It seems unlikely that the subject's height exceeds 3 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
        }
        if (parsedValue < 0.1) {
            return "It seems unlikely that the subject's height is less than 0.1 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
        }
    }
    return "Invalid height value";
});

// Define the birth year validation rule
defineRule("birthYearRule", (value) => {
    const currentYear = new Date().getFullYear();
    if (!value) return true;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
        if (parsedValue >= 1900 && parsedValue <= currentYear) return true;
        if (parsedValue > currentYear) {
            return `The subject's birth year cannot be set in the future. Please ensure that you are using the correct units. The birth year should be earlier than the current year ${currentYear} and specified in years (yyyy) format.`;
        }
        if (parsedValue < 1900) {
            return "It seems unlikely that the subject's birth year predates 1900. Please ensure that you are using the correct units. The birth year should be specified in years (yyyy) format.";
        }
    }
    return "Invalid birth year value";
});

// Define the subject tags validation rule
defineRule("subjectTagsRule", (value) => {
    if (!value) return true;
    if (Array.isArray(value) && value.length > 0) return true;
    if (!Array.isArray(value)) {
        return "The subject tags must be contained in an array.";
    }
    if (Array.isArray(value) && value.length === 0) {
        return "You must add at least one subject tag. For subjects with no conditions, select 'Unimpaired'.";
    }
    return "Invalid subject tags value";
});

// Export rules
export const rules = {
    weightRule: { weightRule: true },
    heightRule: { heightRule: true },
    birthYearRule: { birthYearRule: true },
    subjectTagsRule: { subjectTagsRule: true }
};
