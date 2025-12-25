// Fonction de comparaison pour trier les shifts chronologiquement
export const compareShifts = (shiftA: string, shiftB: string): number => {
  // Extraire l'heure de début (ex: "8:00" de "8:00 - 16:00")
  const getStartTime = (shift: string) => {
    const [time] = shift.split(" - ");
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes; // Convertir en minutes totales
  };

  return getStartTime(shiftA) - getStartTime(shiftB);
};

// Fonction de comparaison pour les situations (objets avec label)
export const compareSituations = (
  situationA: { label: string },
  situationB: { label: string },
): number => {
  return situationA.label.localeCompare(situationB.label);
};
