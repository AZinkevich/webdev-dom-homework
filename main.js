import { fetchGet, comLoader, fetchPost } from "./api.js";
import { renderComments } from "./renderComments.js";
import { formatDate } from "./formatdate.js";

//import { userInput1, userInput2 } from "./userinput.js";

export const nameEl = document.getElementById("add-form-name");
export const textEl = document.getElementById("add-form-text");
export const buttonEl = document.getElementById("add-form-button");

export const formEl = document.getElementById("add-form");
export const formLoader = document.getElementById("form-loader");

let comments = [];



buttonEl.disabled = true;
//userInput1({ nameEl, textEl, formEl, buttonEl });
nameEl.addEventListener("input", evnt);
textEl.addEventListener("input", evnt);
function evnt(event) {
  if (event.target.value !== "") buttonEl.disabled = false;
}

formEl.addEventListener("keyup", (e) => {
  if (!e.shiftKey && e.code === "Enter") {
    buttonEl.click();
  }
});

buttonEl.addEventListener("click", () => {
  //userInput2({ nameEl, textEl});
  nameEl.value = nameEl.value.trim();
  textEl.value = textEl.value.trim();

  nameEl.classList.remove("add-form_error");
  textEl.classList.remove("add-form_error");

  if (nameEl.value === "" && textEl.value === "") {
    nameEl.classList.add("add-form_error");
    textEl.classList.add("add-form_error");
    return;
  } else if (nameEl.value === "") {
    nameEl.classList.add("add-form_error");
    return;
  } else if (textEl.value === "") {
    textEl.classList.add("add-form_error");
    return;
  }

  fetchPost({ text: textEl.value, name: nameEl.value })
    .then(() => {
      return fetchGet();
    })
    .then(() => {
      buttonEl.disabled = true;
      nameEl.value = "";
      textEl.value = "";
      formEl.classList.remove("add-form_displayNone");
      formLoader.hidden = true;
    })
    .catch((error) => {
      formEl.classList.remove("add-form_displayNone");
      formLoader.hidden = true;

      if (error.message === "Неправильный запрос") {
        alert("Длина имени и комментария должна быть более 3 символов");
        console.warn(error);
        return;
      }
      if (error.message === "Сервер сломался") {
        console.warn(error);
        console.log("Повторная отправка");
        fetchPost({ text: textEl.value, name: nameEl.value });
        return;
      }
      if (error.message === "Failed to fetch") {
        console.warn(error);
        alert(
          "Сбой подключения! Пожалуйста, проверьте подключение и повторите отправку."
        );
        comLoader.textContent =
          "Комментарии не загружены. Пожалуйста, проверьте подключение и повторите отправку.";
        return;
      }
    });
  renderComments(comments);
});

fetchGet()
  .then((responseData) => {
    const appComments = responseData.comments.map((comment) => {
      return {
        name: comment.author.name,
        text: comment.text,
        like_active: comment.isLiked,
        like_count: comment.likes,
        date: formatDate(new Date(comment.date)),
        //forceError: true,
      };
    });
    comLoader.hidden = true;
    comments = appComments;
   renderComments(comments);
  })
  .catch((error) => {
    if (error.message === "Failed to fetch") {
      console.warn(error);
      alert(
        "Сбой подключения! Пожалуйста, проверьте подключение и обновите страницу."
      );
      comLoader.textContent =
        "Комментарии не загружены. Пожалуйста, проверьте подключение и обновите страницу.";
      return;
    }
    if (error.message === "Сервер сломался") {
      console.warn(error);
      console.log("Повторная загрузка");
      fetchGet();
      return;
    }
  });

renderComments(comments);