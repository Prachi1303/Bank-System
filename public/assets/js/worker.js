function checkError() {
  let error = document.getElementById("error").value;

  if (error != "") {
    if (error == "1") {
      Swal.fire("Error", "A Server Error Has Occured !", "error");
    } else if (error == "2") {
      Swal.fire("Success", "User Created Successfully !", "success");
    } else if (error == "3") {
      Swal.fire("Warning", "User Already Registered !", "warning");
    }
  }
}

/* Function for transfering the amoung */

function transferAmount() {
  let sender = document.getElementById("sender");
  let receiver = document.getElementById("receiver");
  let amount = document.getElementById("amount");

  if (sender.value == "" || receiver.value == "" || amount.value == "") {
    Swal.fire("Warning", "Please Provide All Details !", "warning");
  } else {
    if (sender.value == receiver.value) {
      Swal.fire("Warning", "Receiver and Sender cannot be Same !", "warning");
    } else {
      fetch("/transferAmount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: sender.value,
          receiver: receiver.value,
          amount: amount.value,
        }),
      })
        .then((response) => response.json())
        .then((obj) => {
          if (obj.eid == 1) {
            Swal.fire("Success", obj.error, "success");
            sender.value = "";
            receiver.value = "";
            amount.value = "";
          } else {
            Swal.fire("Warning", obj.error, "warning");
          }
        });
    }
  }
}
