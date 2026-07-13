export interface NutritionTarget {
    caloriesKcal: number;
    proteinGrams: number;
    waterMl: number;
    ageRangeLabel: string;
}

/** Computes whole-years age from a date of birth. */
export function getAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > dateOfBirth.getMonth() ||
        (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
    if (!hasHadBirthdayThisYear) age -= 1;
    return age;
}

/**
 * Returns simplified daily nutrition targets for an adult based on standard
 * age-bracket dietary guidelines (19-30, 31-50, 51-70, 71+). Values are
 * general adult averages, not personalised medical advice.
 */
export function getNutritionTarget(age: number): NutritionTarget {
    if (age < 19) return { caloriesKcal: 2200, proteinGrams: 52, waterMl: 2600, ageRangeLabel: "Under 19" };
    if (age <= 30) return { caloriesKcal: 2400, proteinGrams: 56, waterMl: 3000, ageRangeLabel: "19-30" };
    if (age <= 50) return { caloriesKcal: 2200, proteinGrams: 56, waterMl: 2700, ageRangeLabel: "31-50" };
    if (age <= 70) return { caloriesKcal: 2000, proteinGrams: 60, waterMl: 2500, ageRangeLabel: "51-70" };
    return { caloriesKcal: 1800, proteinGrams: 65, waterMl: 2200, ageRangeLabel: "71+" };
}
