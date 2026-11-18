import request from "supertest";
import app from "../src/Server.js";

describe("PawHaven API",()=>{
    //TEST 1:Root route
    test("GET / should return API status", async ()=>{
        const responce = await request(app).get("/");

        expect(responce.statusCode).toBe(200);
        expect(responce.body.success).toBe(true);
        expect(responce.body.message).toBe("PawHaven API is running");
    });

    //Test2 :Health-check route
    test("GET/api/health should return backend status", async ()=>{
        const responce=await request(app).get("/api/health");
        expect(responce.statusCode).toBe(200);
        expect(responce.body.success).toBe(true);
        expect(responce.body.message).toBe("PawHaven backend is working");
    });

    //Test 3:Unknown route

    test("Unknown route should return 404", async ()=>{
        const responce=await request(app).get("/does-not-exist");
        expect(responce.statusCode).toBe(404);
        expect(responce.body.success).toBe(false);
    });
});