// use IIFE (immediate ivoked function) to keep private vairables??

// budget module (budget controller)
let budgetController = (function (){

    // choose to make function constructor in order to make lots of other expenses
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        // when inital percentage is not defined, we use -1 
        this.percentage = -1;
    };
    
    // one function just do one thing, so calcPercentage just cuculate the exp percentage
    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome ) * 100);
        } else {
            this.percentage = -1;
        }

    };

    // getPercentages function just return the result of percentage (get from function of calcPercentage) 
    Expense.prototype.getPercentages = function(){
        return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value = value
    };

    // below create a private function inside the function budgetController
    let caculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(currentElement) {
            sum += currentElement.value;
        });
        data.totals[type] = sum;
    };

    // data structure below
    let data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc:0
        },
        budget: 0,
        // we sent percentage to -1 meaning that it doesn't exit at this moment
        percentage: -1,
}

    return {
        addItem : function(type, des, val){
            let newItem, ID;
            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                console.log("ID", ID);
            } else {
                ID = 0;
            }
        
            
            // Create new Item based on 'exp' or 'inc' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            // push newItem to our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            let ids, index;
            // to find the index of the (to be deleted) item'id and then delete the item using splice method
            ids =  data.allItems[type].map(function(current){
               console.log('current', current);
                return current.id;
            });
            
            index = ids.indexOf(id);
            if( index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }
        },

        caculateBudget : function(){

            // caculate total income and expenses
            caculateTotal('exp');
            caculateTotal('inc');

            // Caculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // caculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
        }, 

        // caculate each expense in the object 
        caculatePercentages : function (){
             data.allItems.exp.forEach(function(cur){
                 cur.calcPercentage(data.totals.inc);
             });
        },

        getPercentages: function(){

         let allPerc = data.allItems.exp.map(function(cur){
             return cur.getPercentages();
         });
         return allPerc;          
        },

        // function below juste return the data (budget) will be used in controller
        getBudget: function() {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();


// UI module (UI controller)
let UIController = (function(){
 
    // create an object variable to central all strings so we can change the variables here instead of entire application
    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    // create private function below 
    let   formatNumber = function(num, type) {
        let numSplit, int, dec;
        /*
        + or - before number exactly 2 decimal points comma separating the thousands */
        num = Math.abs(num);
        num = num.toFixed(2);

        // 2310.4567 --> + 2,310.46 
        // 2000 --> 2, 000.00 
        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            // input 23510, output 23, 510 
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    // another private function to check this method ??? 
    let nodeListForEach = function(list, callback){
        for (let i = 0; i < list.length; i++){
            callback(list[i], i);
                }
        };

    // below create public function can be used publicly (return an object with an method)
    return {
        getinput : function(){
            return {
            // get the value specified inside the HTML option will be either inc or exp
            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            // parseFloat() converting string to number
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
        }
        },

        addListItem: function (obj, type){
            let html, newHtml;
            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
        
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            //get type where?? 
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

            deleteListItem: function (selectorID) {
                let el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

        // function below to clear HTML fields
        clearFields: function(){
            let fields;

            // use querySelectorAll returning a NodeList
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // converting a DOM NodeList into a regular array
            let fieldsArr = Array.prototype.slice.call(fields);
            console.log("fieldsArr:", fieldsArr);

            // better way to loop an array (forEach) then for loops
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            })

            // set focus on the first element of the arr by using method focus()
            fieldsArr[0].focus();
        },

        // obj get from getBudget from budgetController
        displayBudget: function (obj){
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLable).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            
            // fields are the Nodelist 
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            console.log('fileds:', fields);

            nodeListForEach(fields, function(current, index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            let now, year, month, months;

            // use Date() constructor to create now
            now = new Date();
            // let christmas = new Date(2016, 11, 25)

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){

            // below return a nodeList 
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ','+
                DOMstrings.inputValue
            );

            // change color UI 
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings : function(){
            return DOMstrings;
        }
    }


})();


// controller module (global APP controller)
// use budgetCtrl, UICtrl two variables so when changing name, we can juste change budgetCtroller and UIController to keep function easy to use
let controller = (function(budgetCtrl, UICtrl){
    
    let setupEventListeners = function(){

    let DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // use enter keyboard to select the input value
    document.addEventListener('keypress', function(event){
    //event.keyCode is deprecated/not recommanded. Instead, use event.code
        if(event.code === "Enter"){
            ctrlAddItem();
        }
    });

    // event deligation
    document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);

    // change UI style while input 
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    let updateBudget = function(){

        // 1. Caculate the budget
        budgetCtrl.caculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentage = function (){
        // 1. Caculate the percentage 
        budgetCtrl.caculatePercentages();

        // 2. Read percentage from the budget controller 
        let percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentage 
        UICtrl.displayPercentages(percentages);
    };


    let ctrlAddItem = function(){
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getinput();

        // 2. Add the item to the budget controller
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI 
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the input fields
            UICtrl.clearFields();

            // 5. caculate and update the budget
            updateBudget();

            // 6. Caculate and update the percentages 
            updatePercentage();
        }
    };

    // function to delete an item
    let ctrDeleteItem = function(event) {
        let itemID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item form the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

        }
    };

    return {
        init : function (){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();