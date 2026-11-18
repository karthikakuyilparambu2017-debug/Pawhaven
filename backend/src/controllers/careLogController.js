import {
  createCareLog,
  getPetCareLogs,
  getOneCareLog,
  updateCareLog,
  removeCareLog,
} from "../services/careLogService.js";

export async function addCareLog(req, res, next) {
  try {
    const careLog = await createCareLog(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Care log created successfully",
      careLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCareLogs(req, res, next) {
  try {
    const careLogs = await getPetCareLogs(
      req.params.petId,
      req.user
    );

    res.status(200).json({
      success: true,
      careLogs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCareLog(req, res, next) {
  try {
    const careLog = await getOneCareLog(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      careLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function editCareLog(req, res, next) {
  try {
    const careLog = await updateCareLog(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Care log updated successfully",
      careLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCareLog(req, res, next) {
  try {
    const careLog = await removeCareLog(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Care log deleted successfully",
      careLog,
    });
  } catch (error) {
    next(error);
  }
}