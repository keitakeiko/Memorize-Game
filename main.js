//狀態機，定義所有遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
};



//處理花色
//此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", //黑陶
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", //愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", //方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" //梅花
];




//index  0-12 為一組
// 原式為 const view = {
//   displayCards: function displayCards() (...)
// } 當物件的屬性與函式/變數名稱相同時，可以省略不寫

const view = {

  getCardElement(index) {  // 取得牌背
    return `
      <div data-index="${index}" class="card back">
      </div>  
    `
  },

  getCardContent(index) {  //取得牌面
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src="${symbol}" alt=""/>
        <p>${number}</p>
    `
  },

  transformNumber(number) {
    //狀況有 4 種，在這裡用 switch 會比 if/else 清楚
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },


  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    rootElement.innerHTML = indexes.map(index =>
      this.getCardElement(index)).join('')
    //Array.from 產生連續數字的陣列，會將類陣列轉為 Array 實體
    //keys() 方法會回傳一個包含陣列中的每一個索引之鍵（keys）的新 Array Iterator 物件。
    //map() 方法會建立一個新的陣列，其內容為原陣列的每一個元素經由回呼函式運算後所回傳的結果之集合。
    //join() 方法會將陣列（或一個類陣列（array-like）物件）中所有的元素連接、合併成一個字串，並回傳此字串。 可用() ('') ('-')
  },

  flipCards(...cards) {
    // console.log(card);
    cards.map(card => {
      if (card.classList.contains("back")) {
        //回傳正面
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      //回傳背面
      card.classList.add("back");
      card.innerHTML = null;
    })
  },




  pairCards(...card) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event =>
        event.target.classList.remove('wrong'), { once: true }) //要求在事件執行一次之後，就要卸載這個監聽器。
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)  //before()的參數既可以是DOM元素，也可以是DOM節點，甚至可以直接字符內容;
  }
};

//Model 是集中管理資料的地方
const model = {

  score: 0,

  triedTimes: 0,

  revealedCards: [],  //暫存牌組

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}


//controller 依遊戲狀態來分配動作，推進遊戲
const controller = {

  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {  //參數符合 case 的 value 值後，再執行後續程式
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)

        view.flipCards(card)
        model.revealedCards.push(card)

        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)

          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          // view.pairCard(model.revealedCards[0])
          // view.pairCard(model.revealedCards[1])
          model.revealedCards = []

          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)   //setTimeout (function, ms) 在計時器跑完以後，就會執行函式內容。
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card =>
      card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)  //... 這三個點可以把陣列展開成個別的值，也可以把個別的值蒐集起來變成陣列。
    // view.flipCard(model.revealedCards[0])  //翻回背面
    // view.flipCard(model.revealedCards[1])
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}







//外借 Fisher-yates 演算法
const utility = {
  getRandomNumberArray(count) {  //count 陣列長度
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) { //由後往前。 0-51，共 52 個
      let randomIndex = Math.floor(Math.random() * (index + 1)) // * 52 個
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


// const utility = {  有前往後版，效能會差一點點
//   getRandomNumberArray(count) {  //count 陣列長度
//     const number = Array.from(Array(count).keys())
//     for (let index = 0; index < number.length; index++) {
//       let randomIndex = Math.floor(Math.random() * (count - index)) + index
//         ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
//     }
//     return number
//   }
// }



controller.generateCards() // 取代 view.displayCards()


// view.displayCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card)
  });
});