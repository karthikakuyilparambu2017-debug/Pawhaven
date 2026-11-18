import {
  createNewSuite,
  listAllSuites,
  getSuiteById,
  updateExistingSuite,
  removeSuite,
} from "../services/suiteService.js";


// ======================================================
// CREATE SUITE
// ======================================================

export async function createSuite(
  req,
  res,
  next
) {
  try {
    const suite = await createNewSuite(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Suite created successfully",
      suite,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// GET ALL SUITES
// ======================================================

export async function getSuites(
  req,
  res,
  next
) {
  try {
    const suites = await listAllSuites();

    res.status(200).json({
      success: true,
      count: suites.length,
      suites,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// GET ONE SUITE
// ======================================================

export async function getSuite(
  req,
  res,
  next
) {
  try {
    const suite = await getSuiteById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      suite,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// UPDATE SUITE
// ======================================================

export async function updateSuite(
  req,
  res,
  next
) {
  try {
    const suite =
      await updateExistingSuite(
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Suite updated successfully",
      suite,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// DELETE SUITE
// ======================================================

export async function deleteSuite(
  req,
  res,
  next
) {
  try {
    const suite = await removeSuite(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Suite deleted successfully",
      suite,
    });
  } catch (error) {
    next(error);
  }
}