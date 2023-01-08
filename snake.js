var snakeGame = function(element, options) {
    
    // Устаноить параметры или установить значения по умолчанию
    var options = options || {},
        boardSize = options.boardSize || 20,
        gameMode = options.gameMode || "normal",
        gameSpeed = options.gameSpeed || 70;
    
    var numSquares = boardSize * boardSize;
    
    // Доска будет заполнена "o" для начала, "s" для змейки, "f" для еды
    var board = new Array(numSquares).fill("o"),
        gameStarted = false,
        gameOver = false,
        intervalId;
    
    // Переменные змейки 
    // snakeArray - это массив индексов позиций на доске, которые занимает змейка
    var snakeArray = [ ],
        snakeLength = 1,
        // snakeMoving - это направление, в котором движется змейка
        snakeMoving = null,
        // snakeFacing - это направление, в котором будет двигаться змейка
        snakeFacing = "up",
        snakeHead,
        snakeTail,
        nextSquare;
        
    
    // Создание элементов DOM
    var DOM_board_container = quickCreateElement("div", "board"),
        DOM_gameMessage = quickCreateElement("div", "message"),  
        DOM_board = [ ];
    for (var i=0; i<numSquares; i++) {
        DOM_board.push(quickCreateElement("div", "square", "square" + i));
    }   
    
    // Организация элементов DOM: добавить квадраты на доску (можно комбинировать с вышеуказанным циклом) 
    for (var i=0; i<numSquares; i++) {
        DOM_board_container.appendChild(DOM_board[i]);
    }      
    
    // Появление змейки на доске
    var startPoint;
    if (boardSize % 2 === 0) {
        startPoint = Math.floor(numSquares/2 + boardSize/2);
    }
    else {
        startPoint = Math.floor(numSquares/2);
    }
    
    snakeArray.push(startPoint);
    snakeHead = startPoint;
    board[startPoint] = "s";
    DOM_board[startPoint].classList.add("snake");
        
    // Добавление кнопок для направления змейки   
    document.addEventListener("keydown", function(e) {
        if (!gameStarted) {
            startGame();
        }
        switch(e.which) {
            case 37: // Влево
                if (snakeMoving != "right") {
                    snakeFacing = "left";
                }
                break;
            case 38: // Вверх
                if (snakeMoving != "down") {
                    snakeFacing = "up";
                }
                break;
            case 39: // Вправо
                if (snakeMoving != "left") {
                    snakeFacing = "right";
                }
                break;
            case 40: // Вниз
                if (snakeMoving != "up") {
                    snakeFacing = "down";
                }
                break;
            // Выход из этого обработчика
            default: return;
        }
        // Запрет действия по умолчанию, например, прокрутку
        e.preventDefault();
    });
      
    // Вспомогательные функции
    
    // Функция для быстрого создания элемента DOM с определенным типом, классом, идентификатором
    function quickCreateElement(type, cls, id) {
        var ret = document.createElement(type);
        if (cls) { ret.classList.add(cls); }
        if (id) { ret.id = id; }
        return ret
    }

    // Функции процесса
    
    function resetDOM () {
        // Способ удалить все дочерние элементы
        while (element.lastChild) {
            element.removeChild(element.firstChild);
        }
    };
    
    function loadInitialDOM() {    
        element.appendChild(DOM_board_container);
        element.appendChild(DOM_gameMessage);
    };
    
    function getNextSquare() {
        snakeHead = snakeArray[snakeLength - 1];
        snakeMoving = snakeFacing;
        if (snakeFacing === "left") {
            if (snakeHead % boardSize === 0) {
                return "out of bounds"
            }
            else {
                return snakeHead - 1;
            }
        }
        else if (snakeFacing === "right") {
            if (snakeHead % boardSize === boardSize - 1) {
                return "out of bounds"
            }
            else {
                return snakeHead + 1;
            }
        }
        else if (snakeFacing === "up") {
            if (snakeHead < boardSize) {
                return "out of bounds"
            }
            else {
                return snakeHead - boardSize;
            }
        }
        else if (snakeFacing === "down") {
            if (snakeHead >= boardSize * (boardSize - 1)) {
                return "out of bounds"
            }
            else {
                return snakeHead + boardSize;
            }
        }
    };
    
    function moveSnakeToNextSquare() {
        if (nextSquare === "out of bounds") {
            // Смерть
            window.clearInterval(intervalId);
            gameOver = true;
            // console.log("Смерть за пределами");
        }
        else if (board[nextSquare] === "o") {
            // Перемещение на открытую площадь
            snakeTail = snakeArray.shift();
            // Обновление доски и переменной змейки
            snakeArray.push(nextSquare);
            board[nextSquare] = "s";
            board[snakeTail] = "o";
            // Обновление DOM
            DOM_board[nextSquare].classList.add("snake");
            DOM_board[snakeTail].classList.remove("snake"); 
        }
        else if (board[nextSquare] === "f") {
            // Съесть еду
            // Обновление доски и переменной змейки
            snakeArray.push(nextSquare);
            board[nextSquare] = "s";
            // Обновление DOM
            DOM_board[nextSquare].classList.add("snake");
            DOM_board[nextSquare].classList.remove("food");
           
            snakeLength += 1;
            generateFood();
            if (gameMode === "greedy" && snakeLength % 5 === 0) {
                generateFood();
            }
            // console.log("Съела еду");
        }
        else if (board[nextSquare] === "s") {
            // Смерть
            window.clearInterval(intervalId);
            gameOver = true;
            // console.log("Умерла врезавшись в себя");     
        }
        updateGameMessage();
    };
     
    function generateFood() {
        // ЗАДАЧА: изменить, потому что потенциально проблематично, когда змея становится большой
        var randomIndex = Math.floor(Math.random() * numSquares);
        while (board[randomIndex] != "o") {
            randomIndex = Math.floor(Math.random() * numSquares);
        }
        board[randomIndex] = "f";
        DOM_board[randomIndex].classList.add("food");
    };
    
    function updateGameMessage() {
        var message = "";
        if (!gameStarted) {
            message += "Используйте стрелочки. Нажмите любую кнопку для начала игры."
        }
        else {
            if (gameOver) {
                message += "Конец игры! ";
            }
            message += "Счет: " + snakeLength;
        }
        DOM_gameMessage.innerHTML = message;      
    };
    
    function startGame () {
        gameStarted = true;
        generateFood();
        if (gameMode === "greedy") {
           generateFood();
           generateFood(); 
        }
        intervalId = window.setInterval(continueGame, gameSpeed);
    };
    
    function continueGame() {
        // Для отслеживания времени (в настоящее время не используется)
        // var timeLog = Date.now();
        nextSquare = getNextSquare();
        moveSnakeToNextSquare();
    };
    
    // НАЧАТЬ ИГРУ
    resetDOM();
    loadInitialDOM();
    updateGameMessage();
    // Ожидание нажатия кнопки для начала игры

};