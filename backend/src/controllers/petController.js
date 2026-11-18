import {
  listMyPets,
  getPetById,
  createNewPet,
  updatePetDetails,
  deletePetById,
} from "../services/petService.js";

export async function getMyPets(req, res, next) {
  try {
    const pets = await listMyPets(req.user._id);

    res.status(200).json({
      success: true,
      pets,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOnePet(req, res, next) {
  try {
    const pet = await getPetById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      pet,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPet(req, res, next) {
  try {
    const pet = await createNewPet(
      req.body,
      req.user,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "Pet created successfully",
      pet,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePet(req, res, next) {
  try {
    const pet = await updatePetDetails(
      req.params.id,
      req.body,
      req.user,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "Pet updated successfully",
      pet,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePet(req, res, next) {
  try {
    const pet = await deletePetById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Pet deleted successfully",
      pet,
    });
  } catch (error) {
    next(error);
  }
}