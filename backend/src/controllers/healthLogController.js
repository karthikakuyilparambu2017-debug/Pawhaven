import {
  createHealthRecord,
  listPetHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} from "../services/healthLogService.js";

export async function addHealthLog(req, res, next) {
  try {
    const healthLog = await createHealthRecord(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Health record created successfully",
      healthLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHealthLogs(req, res, next) {
  try {
    const healthLogs = await listPetHealthRecords(
      req.params.petId,
      req.user
    );

    res.status(200).json({
      success: true,
      healthLogs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOneHealthLog(req, res, next) {
  try {
    const healthLog = await getHealthRecordById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      healthLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function editHealthLog(req, res, next) {
  try {
    const healthLog = await updateHealthRecord(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Health record updated successfully",
      healthLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHealthLog(req, res, next) {
  try {
    const healthLog = await deleteHealthRecord(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Health record deleted successfully",
      healthLog,
    });
  } catch (error) {
    next(error);
  }
}