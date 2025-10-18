export function cardNumberField() {
  (function manageCardNumberField() {
    const inputFields = document.querySelectorAll(".card-number__part");

    function focusFirstField() {
      if (inputFields[0].value === "" || inputFields[0].value.length < 4) {
        inputFields[0].focus();
      }
    }

    inputFields.forEach((domInput, index) => {
      domInput.addEventListener("input", (e) => {
        const sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = sanitizedValue;

        if (sanitizedValue.length === e.target.maxLength) {
          const nextInput = e.target.nextElementSibling;
          if (nextInput) {
            nextInput.focus();
          }
        }
      });

      domInput.addEventListener("keydown", (e) => {
        if (e.code === "Backspace" && e.target.value.length === 0) {
          const previousInput = e.target.previousElementSibling;
          if (previousInput) {
            previousInput.focus();
          }
        }
      });

      domInput.addEventListener("click", (e) => {
        if (
          index === 0 &&
          (domInput.value === "" || domInput.value.length < 4)
        ) {
          domInput.focus();
        } else if (
          index !== 0 &&
          (inputFields[0].value === "" || inputFields[0].value.length < 4)
        ) {
          focusFirstField();
        }
      });
    });

    focusFirstField();
  })();
}
