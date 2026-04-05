const phrases = [
  "Наш менеджер передзвонить Вам найближчим часом!",
  "Уточнити деталі можна за телефоном 123456789",
  "Залишайтеся на зв'язку!",
  "Сьогодні чудова погода!",
  "З Вами дуже приємно спілкуватися!",
];

const hello = "Привіт!";
const goodbye = "До побачення!";

$("h1").css("color", "blue");

$("#chatbot").click(function () {
  $(this).toggleClass("show");
});

$("#answers").append(`<div class="bot_answ">${hello}</div>`);

// stopPropagation()
$("#answers").click(function () {
  return false;
});

$("#question").click(function () {
  return false;
});

$("#ok").click(function () {
  let q = $("#question").val().trim();
  // console.log(q);
  $("#question").val("");
  if (q !== "") {
    $("#answers").append(`<div class="human_answ">${q}</div>`);

    setTimeout(function () {
      if (
        q.toLowerCase().includes("bye") ||
        q.toLowerCase().includes("побачення") ||
        q.toLowerCase().includes("пока") ||
        q.toLowerCase().includes("попа")
      ) {
        $("#answers").append(`<div class="bot_answ">${goodbye}</div>`);
      } else {
        $("#answers").append(`<div class="bot_answ">${phrases[0]}</div>`);
      }
      const chatBot = document.getElementById("chatbot");
      $("#chatbot").animate(
        {
          scrollTop: chatBot.scrollHeight - chatBot.clientHeight,
        },
        100,
      );
    }, 1000);
  }
  return false;
});

function enterKey(event) {
  if (event.keyCode == 13) {
    $("#ok").click();
    return false;
  }
}

$("#question").keypress("keyup", enterKey);
