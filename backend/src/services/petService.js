import Pet from "../models/Pet.js";
import AppError from "../utils/appError.js";
import { uploadImage } from "./uploadService.js";

export async function listMyPets(userId){
    const pets=await Pet.find({
        owner:userId,
        isActive:true, 
    }).sort({createdAt:-1});
    return pets;
}

export async function getPetById(petId,user) {
    const pet=await Pet.findOne({
        _id:petId,
        isActive:true,
    });
    if(!pet){
        throw new AppError("pet not found",404);
    }
    const isOwner=
    pet.owner.toString()=== user._id.toString();
    const isStaff=[
        "STAFF",
        "VETERINARIAN",
        "ADMIN",
    ].includes(user.role);
    if(!isOwner && !isStaff){
        throw new AppError("you are not authorized  to view this pet",403);
    }
    return pet;
}

export async function  createNewPet(data,user,file) {
    const{
        name,
        species,
        breed,
        age,
        gender,
        weight,
        medicalNotes,
        vaccinationStatus,
    }= data;
    let imageUrl="";

    if(file){
        imageUrl=await uploadImage(
            file,
            "pawhaven/pets"
        );
    }

const pet=await Pet.create({
    owner:user._id,
    name,
    species,
    breed,
    age,
    gender,
    weight,
    image:imageUrl,
    medicalNotes,
    vaccinationStatus
});
return pet;
}

export async function updatePetDetails(petId,data,user,file) {
   const pet=await Pet.findOne({
    _id:petId,
    isActive:true,
   }) ;
   if(!pet){
    throw new AppError("Pet not found",404);
   }
   const isOwner=
   pet.owner.toString()===user._id.toString();
   const isAdmin=user.role==="ADMIN";
   if(!isOwner && !isAdmin) {
    throw new AppError("you are not authorized to update this pet",403);
   }
   const allowedFields=[
    "name",
    "species",
    "breed",
    "age",
    "gender",
    "weight",
    "medicalNotes",
    "vaccinationStatus",
   ];
    for (const field of allowedFields) {
    if (data[field] !== undefined) {
      pet[field] = data[field];
    }
  }
   if (file) {
    const imageUrl = await uploadImage(
      file,
      "pawhaven/pets"
    );

    pet.image = imageUrl;
  }

  await pet.save();

  return pet;
}

export async function deletePetById(petId, user) {
  const pet = await Pet.findOne({
    _id: petId,
    isActive: true,
  });

  if (!pet) {
    throw new AppError("Pet not found", 404);
  }

  const isOwner =
    pet.owner.toString() === user._id.toString();

  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new AppError(
      "You are not authorized to delete this pet",
      403
    );
  }
  pet.isActive = false;
await pet.save();
   return pet;
}