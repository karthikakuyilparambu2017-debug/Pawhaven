import { makeResource } from "./resourceSlice";
export const suites = makeResource("suites", "/suites");
export const {
  fetchAll: fetchSuites,
  create: addSuite,
  update: editSuite,
  remove: removeSuite,
} = suites;
export default suites.reducer;