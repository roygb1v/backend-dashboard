console.log('Hello this is up and running');

$(function() {
  function generateProductHash(productArray) {
    let hsh = {};
    for (let i = 0; i < productArray.length; i += 1) {
      let currentObject = productArray[i];
      let reason = currentObject.reason || "";

      if (hsh[currentObject.pId]) {
        hsh[currentObject.pId].push({pId: currentObject.pId, imageBuffer: currentObject.image, reason: reason})
      } else {
        hsh[currentObject.pId] = [{pId: currentObject.pId, imageBuffer: currentObject.image, reason: reason}];
      }
    }
    return hsh;
  }
  function clearUploadFormFields() {
    $("#pid").val("");
    $("#name").val("");
    $("#fileinput").val("");
  }

  function clearScreen() {
    const currentDisplay = document.querySelectorAll(".main-container");
    for (let i = 0; i < currentDisplay.length; i += 1) {
      let currentNode = currentDisplay[i];
      currentNode.remove();
    }
  }

  function createProductList(hsh) {
    clearScreen();
    for (let obj in hsh) {
      let div = document.createElement('div');
      let closeDiv = document.createElement('div');
      $(closeDiv).attr('class', 'x-close');
      let ul = document.createElement('ul');
      let h2 = document.createElement('h2');
      // closeDiv.textContent = &#x2716;

      if (hsh[obj][0].reason.trim() !== "") {
        let p = document.createElement('p');
        p.textContent = `Reason: ${hsh[obj][0].reason}`;
        div.append(p);
      }
      
      $(ul).attr('id', 'sortable');
      let pId = hsh[obj][0].pId;
      h2.textContent = pId;

      for (let i = 0; i < hsh[obj].length; i += 1) {
        let currentImageInUL = hsh[obj][i];
        let li = document.createElement('li');
        li.append(closeDiv);
        let img = document.createElement('img');

        let buffer = currentImageInUL.imageBuffer.data;
        let TYPED_ARRAY = new Uint8Array(buffer);
        let STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        let base64String = btoa(STRING_CHAR);
        img.src = 'data:image/jpg;base64,' + base64String;

        li.append(img);
        ul.append(li);
      }
      $(div).attr('class', 'main-container')
      div.append(h2);
      div.append(ul);
      div.append(createPendingBtn());
      document.body.append(div);

      $(ul).sortable();
      $(ul).disableSelection();
    }
  }

  function disableBtns() {
    $(this).attr("disabled", true);
    $(this).parent().find("#reject-btn").attr("disabled", true);
    $(this).parent().find("#rejection-select").attr("disabled", true)
  }

  function createPendingBtn() {
    let divOne = document.createElement('div');
    let divTwo = document.createElement('div');
    $(divOne).attr('class', 'main-container pending-container');
    let acceptInputBtn = createInputElement('accept');
    let rejectInputBtn = createInputElement('reject');
    let selectOptionsElement = createSelectOptions();

    $(acceptInputBtn).on('click', function(e) {
      e.preventDefault();
      const id = $(this).parent().parent().find('h2').html();
      disableBtns.call(this); // call it in the context of this accept btn
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', `/products/approved/${id}`, true);
      xhr.send();

      xhr.onload = function() {
        console.log(this.response);
      }
    });

    $(rejectInputBtn).on('click', function(e) {
      e.preventDefault();
      const currentOption = $( "#rejection-select option:selected" ).text();
      console.log(currentOption);
      if (currentOption === "--Please choose an option--") {
        alert('Please select an option!');
        return;
      }
      const id = $(this).parent().parent().parent().find('h2').html();
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'json';

      xhr.open('POST', `/products/rejected/${id}`, true);
      let formData = new FormData(document.getElementById('myform'));
      xhr.send(formData);

      xhr.onload = function() {
        console.log(this.response);
      }
    });

    divOne.append(acceptInputBtn);
    divTwo.append(rejectInputBtn);
    divTwo.append(selectOptionsElement);
    divOne.append(divTwo);
    return divOne;
  }

  function createInputElement(btnType) {
    let inputBtn = document.createElement('input');
    $(inputBtn).attr('class', 'pending-btn');
    $(inputBtn).attr('id', `${btnType}-btn`);
    $(inputBtn).attr('name', `${btnType}-btn`);
    $(inputBtn).attr('type', 'button');
    $(inputBtn).attr('value', `${btnType}`);

    return inputBtn;
  }

  function createSelectOptions() {
    let select = document.createElement('select');
    $(select).attr('name', 'status');
    $(select).attr('id', 'rejection-select');
    
    let blankOption = createOption("", "--Please choose an option--");
    let blurryOption = createOption("blurry", "Pictures are blurry");
    let missingOption = createOption("missing", "Missing Pictures");
    let inappropriateOption = createOption("Inappropriate", "Inappropriate");
    
    select.append(blankOption);
    select.append(blurryOption);
    select.append(missingOption);
    select.append(inappropriateOption);
    
    return select;
  }

  function createOption(val, text) {
    let option = document.createElement('option');
    $(option).attr('value', val);
    option.textContent = text;
    
    return option;
  }

  function sendStatusRequest(statusType) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', `products/${statusType}`, true);
    xhr.send();

    xhr.onload = function() {
      console.log(this.response.products);
      let hsh = generateProductHash(this.response.products);
      createProductList(hsh);
    }
  }

  $( "#sortable" ).sortable();
  $( "#sortable" ).disableSelection();

  $('li').on('mouseout', function(e) {
    e.preventDefault();
    // console.log($('li'));

    // Pass this off to database write or cache it somewhere
  });

  $('.x-close').on('click', function(e) {
    e.preventDefault();
    $(this).parent().remove();
  })

  $('.upload-btn').on('click', function(e) {
    e.preventDefault();

    const myForm = document.getElementById('myform');
    const form = new FormData(myForm);

    const xhr = new XMLHttpRequest();
    // xhr.responseType = 'image/jpg'
    xhr.responseType = 'json';
    xhr.open("POST", '/upload', true);
    xhr.send(form);

    xhr.onload= function() {
      console.log(this.response.image.data, this.response);
      clearUploadFormFields();
    }
  });

  $("#status-select").change(function() {
    let currentOption = $(this).val();
    console.log(currentOption);

    if (currentOption === "pending") {
      sendStatusRequest('pending');
    } else if (currentOption === "approved") {
      sendStatusRequest('approved');
    } else if (currentOption === "rejected") {
      sendStatusRequest('rejected');
    }
  });
});