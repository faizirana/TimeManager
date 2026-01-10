import db from "../../models/index.cjs";

const { Timetable, Team } = db;

// Fonction helper pour vérifier les chevauchements
const _checkTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(`1970-01-01T${start1}`);
  const e1 = new Date(`1970-01-01T${end1}`);
  const s2 = new Date(`1970-01-01T${start2}`);
  const e2 = new Date(`1970-01-01T${end2}`);

  return s1 < e2 && s2 < e1;
};

export const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.findAll({
      attributes: ["id", "Shift_start", "Shift_end"],
    });
    return res.status(200).json(timetables);
  } catch (error) {
    console.error("Error fetching timetables:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          as: "Associate",
        },
      ],
    });
    if (!timetable) {
      return res.status(404).json({ message: "Horaire introuvable" });
    }
    return res.status(200).json(timetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const createTimetable = async (req, res) => {
  const { Shift_start, Shift_end } = req.body;

  if (!Shift_start || !Shift_end) {
    return res.status(400).json({
      message: "L'heure de début et de fin sont requises",
    });
  }

  // Vérifier que Shift_start < Shift_end
  const startTime = new Date(`1970-01-01T${Shift_start}`);
  const endTime = new Date(`1970-01-01T${Shift_end}`);

  if (startTime >= endTime) {
    return res.status(400).json({
      message: "L'heure de début doit être avant l'heure de fin",
    });
  }

  try {
    const newTimetable = await Timetable.create({
      Shift_start,
      Shift_end,
    });
    return res.status(201).json(newTimetable);
  } catch (error) {
    console.error("Error creating timetable:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const updateTimetable = async (req, res) => {
  const { Shift_start, Shift_end } = req.body;

  try {
    const timetable = await Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: "Horaire introuvable" });
    }

    // Récupérer les valeurs actuelles ou nouvelles
    const newShiftStart = Shift_start !== undefined ? Shift_start : timetable.Shift_start;
    const newShiftEnd = Shift_end !== undefined ? Shift_end : timetable.Shift_end;

    // Vérifier que Shift_start < Shift_end
    const startTime = new Date(`1970-01-01T${newShiftStart}`);
    const endTime = new Date(`1970-01-01T${newShiftEnd}`);

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "L'heure de début doit être avant l'heure de fin",
      });
    }

    if (Shift_start !== undefined) timetable.Shift_start = Shift_start;
    if (Shift_end !== undefined) timetable.Shift_end = Shift_end;

    await timetable.save();
    return res.status(200).json(timetable);
  } catch (error) {
    console.error("Error updating timetable:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: "Horaire introuvable" });
    }

    await timetable.destroy();
    return res.status(200).json({ message: "Horaire supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
