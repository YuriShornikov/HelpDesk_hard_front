class Form {
  constructor() {
    this.menu = document.querySelector('.menu');
    this.add = document.querySelector('.add');
  }

  // Обработчик кнопки add
  btnAdd() {
    this.add.addEventListener('click', (e) => {
      e.preventDefault();

      // Отрисовка html модального окна add
      const listHTML = `
        <div class="modal add">
          <div class="top">Изменить текст</div>
          <div class="description">Краткое описание</div>
          <input class="input" type="text" placeholder="Введите текст...">
          <div class="description">Подробное описаине</div>
          <input class="input" type="text" placeholder="Введите текст...">
          <div class="bottom">
            <button class="add cancel">Отмена</button>
            <button class="add accept">Ок</button>
          </div>
        </div>
      `
      this.menu.insertAdjacentHTML('beforeend', listHTML);

      // Нахождение всех классов
      const modalAdd = document.querySelector('.modal.add');
      modalAdd.style.display = 'flex';
      const btnAccept = modalAdd.querySelector('.accept');
      const btnCancel = modalAdd.querySelector('.cancel');

      // Обработка кнопок Отмена и Ок
      btnAccept.addEventListener('click', () => this.btnAccept(modalAdd), { once: true });
      btnCancel.addEventListener('click', () => this.btnCancel(modalAdd), { once: true });
    })
  }

  // Обработчик кнопки Ок
  btnAccept(modal) {

    // Поиск полей input
    const inp = modal.querySelectorAll('.input');

    // Удаление модального окна add
    modal.remove();

    // Формирование запроса к серверу create
    const formData = new FormData();
    formData.append('name', `${inp[0].value}`);
    formData.append('description', `${inp[1].value}`);
    formData.append('status', 'true');

    this.makeRequest('POST', 'http://localhost:4000/?method=createTicket', formData).then(response => {
      if (response) {
        console.log('Ticket created:', response);
        console.log(response.id);
      
        // Отрисовка в html листа
        const listHTML = `
          <div class="list" id="${response.id}">
            <button class="btn check"></button>
            <div class="block">
              <div class="name">${inp[0].value}</div>
              <div class="descript">${inp[1].value}</div>
            </div> 
            <button class="btn correct">&#9998;</button>
            <button class="btn delete">&#10006;</button>
          </div>
        `;
        this.menu.insertAdjacentHTML('beforeend', listHTML);
      
        // Поиск всех необходимых классов
        const newList = this.menu.lastElementChild;
        const name = newList.querySelector('.name').textContent;
        const descript = newList.querySelector('.descript').textContent;
        const checkBtn = newList.querySelector('.btn.check');
        const deleteBtn = newList.querySelector('.delete');
        const correctBtn = newList.querySelector('.correct');
      
        // Вызовы кнопок образотчиков
        this.btnCorrect(correctBtn, response.id, name, descript);
        this.btnCheck(checkBtn);
        this.btnDelete(deleteBtn);
      }
    })
    .catch(error => {
      console.error('Error making request:', error);
    });
  }

  // Обработчик кнопки Отмена
  btnCancel(modal) {
    modal.remove();
  }

  // Метод запроса к серверу
  makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: method,
        body: data
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.error('Error making request:', error);
        reject(error);
      });
    });
  }

  // Обработчик кнопки Чек
  btnCheck(btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Проверка на нажатие
        const isChecked = btn.getAttribute('data-checked') === 'true';
        btn.setAttribute('data-checked', !isChecked);
        const list = btn.parentNode;
        let description = list.querySelector('.descript');
        
        // Отображение в html выпадающего блока
        if (isChecked) {
          btn.innerHTML = '';
          description.style.display = 'none';
        } else {
          btn.innerHTML = '&#10003;';
          description.style.display = 'block';
      }
    })
  }

  // Обработчик кнопки Редактирование
  btnCorrect(btn, id, name, description) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(id)

      // Отрисовываем модальное окно Редактора
      const listHTML = `
        <div class="modal add">
          <div class="top">Изменить текст</div>
          <div class="description">Краткое описание</div>
          <input class="input" type="text" placeholder="Введите текст..." value="${name}">
          <div class="description">Подробное описаине</div>
          <input class="input" type="text" placeholder="Введите текст..." value="${description}">
          <div class="bottom">
            <button class="add cancel">Отмена</button>
            <button class="add accept">Ок</button>
          </div>
        </div>
      `
      this.menu.insertAdjacentHTML('beforeend', listHTML);

      // Находим все необходимые классы
      const modalAdd = document.querySelector('.modal.add');
      const btnAccept = modalAdd.querySelector('.accept');
      const btnCancel = modalAdd.querySelector('.cancel');
      const inp = modalAdd.querySelectorAll('.input');
      const list = btn.closest('.list');

      // Обработчик кнопки Ок
      btnAccept.addEventListener('click', () => {

        // Проверка полей ввода
        if (name !== inp[0].value || description !== inp[1].value) {
          list.querySelector('.name').textContent = inp[0].value;
          list.querySelector('.descript').textContent = inp[1].value;

          // Изменение полей
          name = inp[0].value;
          description = inp[1].value;

          // Формирование запроса update
          const formData = new FormData();
          formData.append('id', `${id}`);
          formData.append('name', `${inp[0].value}`);
          formData.append('description', `${inp[1].value}`);
          formData.append('status', 'true');
          this.makeRequest('POST', 'http://localhost:4000/?method=updateTicket', formData)
          .then(response => {
            if (response) {
              console.log('Ticket update:', response);
            }
            // Удаление модального окна
            modalAdd.remove();   
          })
          .catch(error => {
            console.error('Error making request:', error);
          });
        }
      });
      // Обработчик кнопки Отмена
      btnCancel.addEventListener('click', () => this.btnCancel(modalAdd), { once: true });
    });
  }

  // Обработчик кнопки удаления
  btnDelete(btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Получаем id для удаления
      const listId = btn.closest('.list').id;

      // Отрисовываем модальное окно удаления
      const listHTML = `
        <div class="modal delete">
          <div class="top">Удалить тикет</div>
          <div class="description">
            Вы уверены, что хотите удалить тикет? Это </br>
            действительно необратимо.
          </div>
          <div class="bottom">
            <button class="add cancel">Отмена</button>
            <button class="add accept">Ок</button>
          </div>
        </div>
      `
      this.menu.insertAdjacentHTML('beforeend', listHTML);
      
      // Поиск кнопок Ок и Отмена
      const modalDel = document.querySelector('.modal.delete');
      const btnAccept = modalDel.querySelector('.accept');
      const btnCancel = modalDel.querySelector('.cancel');
      
      // Обработчик кнопки Ок
      btnAccept.addEventListener('click', (e) => {
        e.preventDefault();
        modalDel.remove();

        // Отправка запроса на удаление
        this.makeRequest('DELETE', `http://localhost:4000/?method=deleteTicket&id=${listId}`)
        .then(response => {
          if (response) {
            console.log('Ticket deleted:', response);
          } else {
            console.error('Failed to delete ticket');
          }

          // Удаление листа html
          const list = btn.closest('.list');
          if (list) {
            list.remove();
          }
        })
        .catch(error => {
          console.log('Error deleting ticket:', error);
        });
      })

      // Обработчик кнопки Отмена
      btnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        modalDel.remove();
      })
    })
  }
}

const form = new Form();
form.btnAdd();
