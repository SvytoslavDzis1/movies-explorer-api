import React, { useCallback } from "react";
import validator from 'validator';

export function validation(initialState = {}) {
  const [values, setValues] = React.useState(initialState);
  const [errors, setErrors] = React.useState({});
  const [isValid, setIsValid] = React.useState(false);

  const handleChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    setValues({...values, [name]: value});
    setErrors({...errors, [name]: event.target.validationMessage})

    let validEmail;

    if(name === 'email') validEmail = validator.isEmail(value)

    if (name === 'email' && !validEmail) {
      setErrors({...errors, [name]: 'допущена ошибка в email'});
    }

    setIsValid(event.target.closest("form").checkValidity())
  };

  const resetForm = useCallback(
    (newValues = {}, newErrors = {}, newIsValid = false) => {
      setValues(newValues);
      setErrors(newErrors);
      setIsValid(newIsValid);
    },
    [setValues, setErrors, setIsValid]
  );

  return { values, handleChange, errors, isValid, resetForm };
}
