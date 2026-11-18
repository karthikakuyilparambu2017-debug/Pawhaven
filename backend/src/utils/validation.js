// input validation


import appError from "./appError.js";

export function validationStudentInput(body){
    const {name,age,course,email,phone}=body;

    if( !name || typeof name !== "string" || name.trim().length<2){
        throw new appError(
            "Name must contain at least 2 character",400);
    }

    const numericAge=Number(age);
    if(!Number.isInteger(numericAge) || numericAge <1 || numericAge>80){
        throw new appError(
            "Age must be an integer btw 1 and 80",400);
    }
    if(!course || typeof course !=="string" || course.trim().length===0){
        throw new appError(
            "course must be required",400);
    }
    if(email){
        const splitEmail=email.split("@");
        if(splitEmail.length!==2 || splitEmail[0].length ===0 || splitEmail[1]===0 ||!splitEmail[1].includes(".") || splitEmail[1].startsWith(".") || splitEmail[1].endsWith(".") ){
            throw new appError(
                "invalid email address",400);
        }
    }
        return {
            name:name.trim(),
            age:numericAge,
            course:course.trim(),
            email:email?.trim().toLowerCase() || " ",
            phone:phone?.trim() || " "
        };
    
}