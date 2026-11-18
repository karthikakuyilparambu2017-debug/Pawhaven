import { makeResource } from "./resourceSlice.js";
export const pets = makeResource("pets", "/pets");
export const { fetchAll: fetchPets, create: addPet, remove: removePet } = pets;
export default pets.reducer;