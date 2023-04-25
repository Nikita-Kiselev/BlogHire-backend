import { validationResult } from "express-validator"

export default (req,res, next) => {
    const errors = validationResult(req); // проверяет есть ли в запросе ошибки
    if(!errors.isEmpty()){ // отлавливаем ошибки, если что, errors возвращает массив
        return res.status(400).json(errors.array());
    }
    next();
}