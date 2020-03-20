// Элементы страницы
const fromSearch = document.querySelector('.form-search'),
    inputCitiesFrom = fromSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = fromSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = fromSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = fromSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = fromSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets');

// Данные
const citiesApi = 'database/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '9e26db4b991d6d9c10cba18d799f575c',
    caledar = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_count = 10;

let city = [];

// Функция получения данных с сервера
const getData = (url, callBack, errorFunc = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', ()=>{
        if (request.readyState !== 4) return;

        if(request.status === 200) {
            callBack(request.response);
        } else {
            errorFunc(request.status);
        }
    });

    request.send();
}

// Функция поиска городов по буквам
const showCity = (input, list) => {
    list.textContent = '';

    if (input.value === '') return;

    const filterCity = city.filter((item) => {
        const fixItem = item.name.toLowerCase();
        
        return fixItem.startsWith(input.value.toLowerCase());
    });

    filterCity.forEach((item) => {
        const li = document.createElement('li');
        li.classList.add('dropdown__city');
        li.textContent = item.name;
        list.append(li)
    }); 
    
};

// Функция присваивания строки из подсказки
const handlerCity = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};

//Получение название города
const getNameCity =  (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Количество пересадок
const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой': 'С двумя пересадками';
    } else{
        return 'Без пересадок';
    }
};

// Формирование ссылки на авиасеилс
const getLinkAvi = (data) => {
    let link ='https://www.aviasales.ru/search/';
    
    link +=  data.origin;   
    
    const date = new Date(data.depart_date);
    const day = date.getDate();
    const month = date.getMonth()+1;
    
    link += day < 10 ? '0' + day : day;
    link += month < 10 ? '0' + month : month;

    link +=  data.destination;
    link += '1';

    return link;
    
};

// Функция создания карточки
const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if(data) {
        deep = `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAvi(data)}" target="_blank" class="button button__buy">
                    Купить за ${data.value}₽</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>
            
                    <div class="block-right">
                        <div class="changes">${getChanges(data.number_of_changes)}</div>
                        <div class="city__to">Город назначения:
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        deep = '<h3>На текущую дату билетов нет!</h3>';
    }

    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
};

// Получение данных о билетах на выбранную дату
const renderCheapDay = (cheapTiket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    const ticket = createCard(cheapTiket[0]);

    cheapestTicket.append(ticket);
};

// Получение данных о билетах на существующих датах
const renderCheapYear = (cheapTikets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самый дешевый билет на другие даты</h2>';
    cheapTikets.sort((a,b) => a.value - b.value);
    
    for (let i = 0; i < cheapTikets.length && i < MAX_count; i++){
        const ticket = createCard(cheapTikets[i]);
        otherCheapTickets.append(ticket);
    }
    
    
    console.log(cheapTikets);
   
};

// Функция поиска самого дешового билета
const renderCheap = (data, date) => {
    const cheapTiketYear = JSON.parse(data).best_prices;

    const cheapTiketDay = cheapTiketYear.filter((item) => {
        return item.depart_date === date;
    });

    renderCheapDay(cheapTiketDay);
    renderCheapYear(cheapTiketYear);
};

// Получение строки для поиска
inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
});

// Запись города в поле input из подсказки
dropdownCitiesFrom.addEventListener('click', (event) => {
    handlerCity(event, inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesTo.addEventListener('click', (event) => {
    handlerCity(event, inputCitiesTo, dropdownCitiesTo)
});

// Получение кода аэропорта
fromSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    
    

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name),
    cityTo = city.find((item) => inputCitiesTo.value === item.name); 

    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value
    };
    
    if (formData.from && formData.to){
        const requestData =  `?depart_date=${formData.when}&origin=${formData.from.code}`
        +`&destination=${formData.to.code}&one_way=true`;

        getData(caledar + requestData, (response) => {
        renderCheap(response, formData.when);
        }, (error) => {
            cheapestTicket.style.display = 'block';
            otherCheapTickets.style.display = 'none';
            cheapestTicket.innerHTML = '<h2>Рейса в данном направление не существует!</h2>';
            console.error('Ошибка', error);
        });
    } else {
        cheapestTicket.style.display = 'block';
        otherCheapTickets.style.display = 'none';
        cheapestTicket.innerHTML = '<h2>Введите коректное название!</h2>';
    }
});

// Вызовы функций

getData(citiesApi, (data) => {
    city = JSON.parse(data).filter(item => item.name);

    city.sort((a, b) => {
        if (a < b) {return -1;}

        if (a > b) {return 1;}

        return 0;
    });
});




