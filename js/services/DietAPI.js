import TotoAPI from './TotoAPI';
import moment from 'moment';

const categories = [{id: 'meat', name: 'Meat', image: require('../../img/groceries/categories/meat.png')},
                    {id: 'fish', name: 'Fish', image: require('../../img/groceries/categories/fish.png')},
                    {id: 'vegetables', name: 'Veggies', image: require('../../img/groceries/categories/vegetables.png')},
                    {id: 'fruits', name: 'Fruits', image: require('../../img/groceries/categories/fruits.png')},
                    {id: 'smoothie', name: 'Smoothie', image: require('../../img/groceries/categories/smoothie.png')},
                    {id: 'dairy', name: 'Dairy', image: require('../../img/groceries/categories/dairy.png')},
                    {id: 'fastfood', name: 'Fast food', image: require('../../img/groceries/categories/fastfood.png')},
                    {id: 'drinks', name: 'Drinks', image: require('../../img/groceries/categories/drinks.png')},
                    {id: 'bread', name: 'Bread', image: require('../../img/groceries/categories/bread.png')},
                    {id: 'pasta', name: 'Pasta & Rice', image: require('../../img/groceries/categories/pasta.png')},
                    {id: 'cakes', name: 'Cake', image: require('../../img/groceries/categories/cake.png')},
                    {id: 'meal', name: 'Prepared food', image: require('../../img/groceries/categories/meal.png')},
                    {id: 'sauce', name: 'Sauces & Jams', image: require('../../img/groceries/categories/sauce.png')},
                    {id: 'cereals', name: 'Cereals', image: require('../../img/groceries/categories/cereals.png')}
                   ]

/**
 * API to access the /diet Toto API
 */
export default class DietAPI {

  /**
   * Saves the provided meal
   */
  postMeal(meal) {

    let data = {
      date: meal.mealDate,
      time: meal.mealTime,
      calories: meal.calories,
      fat: meal.fat,
      carbs: meal.carbs,
      sugars: meal.sugars,
      proteins: meal.proteins,
      aliments: meal.foods
    };

    // Post the data
    return new TotoAPI().fetch('/diet/meals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));
  }

  /**
   * Saves the provided meal as a prep
   */
  postMealPrep(meal) {

    let data = {
      date: meal.mealDate,
      time: meal.mealTime,
      calories: meal.calories,
      fat: meal.fat,
      carbs: meal.carbs,
      sugars: meal.sugars,
      proteins: meal.proteins,
      aliments: meal.foods
    };

    // Post the data
    return new TotoAPI().fetch('/diet/mealPreps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));
  }

  /**
   * Updates the specified meal prep.
   * Requires:
   * - id: the id of the meal prep to update
   * - meal: the data to update
   */
  putMealPrep(id, meal) {

    let data = {
      date: meal.mealDate,
      time: meal.mealTime,
      calories: meal.calories,
      fat: meal.fat,
      carbs: meal.carbs,
      sugars: meal.sugars,
      proteins: meal.proteins,
      aliments: meal.foods
    };

    // Post the data
    return new TotoAPI().fetch('/diet/mealPreps/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));

  }

  /**
   * Deletes the specified Meal Prep
   */
  deleteMealPrep(id) {

    return new TotoAPI().fetch('/diet/mealPreps/' + id, {
      method: 'DELETE'
    });
  }

  /**
   * Retrieves the meals for the current day
   */
  getTodayMeals() {

    var filter = '?date=' + moment().format('YYYYMMDD');

    return new TotoAPI().fetch('/diet/meals' + filter)
        .then((response) => response.json());

  }

  /**
   * Retrieve the meal preps
   */
  getMealPreps() {

    return new TotoAPI().fetch('/diet/mealPreps').then((response) => response.json());
  }

	/**
	 * Retrieves the meals for a specified date (yyyyMMdd string) or from a specified date
	 */
	getMeals(date, dateFrom) {

		var filter = '';
		if (date != null) filter = '?date=' + date;
		else if (dateFrom != null) filter = '?dateFrom=' + dateFrom;

		return new TotoAPI().fetch('/diet/meals' + filter).then((response) => response.json());
	}

	/**
	 * Returns a Map object of <date: mealsStats> where mealsStats is a {calories, proteins, fats, carbs}
	 *
	 */
	getMealsPerDay(dateFrom) {

		return new Promise(function(success, failure) {

			var filter = '?dateFrom=' + dateFrom;

			new TotoAPI().fetch('/diet/meals' + filter).then((response) => response.json()).then(function(data) {

				// Get the data in the right format
				var mealsStats = {};

        // Create the Map
				for (var i = 0; i < data.meals.length; i++) {

					var stat = mealsStats[data.meals[i].date];

					if (stat == null) {
            mealsStats[data.meals[i].date] = {date: data.meals[i].date, calories: data.meals[i].calories, proteins: data.meals[i].proteins, carbs: data.meals[i].carbs, fats: data.meals[i].fat};
          }
					else {
						stat.calories += data.meals[i].calories;
						stat.proteins += data.meals[i].proteins;
						stat.carbs += data.meals[i].carbs;
						stat.fats += data.meals[i].fat;
					}

				}

				success(mealsStats);

			});

		});
	}

  /**
   * Returns the calories for each day since the specified date
   */
  getCaloriesPerDay(dateFrom) {

    var filter = '?dateFrom=' + dateFrom;

    return new TotoAPI().fetch('/diet/stats/caloriesPerDay' + filter).then((response) => response.json());

  }

  /**
   * Returns the /stats/caloriesPerWeek data
   */
  getCaloriesPerWeek(dateFrom) {

    var filter = '?dateFrom=' + dateFrom;

    return new TotoAPI().fetch('/diet/stats/caloriesPerWeek' + filter).then((response) => response.json());

  }

  /**
   * Returns the categories for the groceries
   */
  getGroceryCategories() {

    return categories;

  }

  /**
   * Returns a category's data, given it's identifier
   */
  getGroceryCategory(categoryId) {

    for (var i = 0; i < categories.length; i++) if (categories[i].id == categoryId) return categories[i];
  }

  /**
   * Retrieves the foods of the specified category (id)
   */
  getGroceries(category) {

    return new TotoAPI().fetch('/diet/foods?category=' + category).then((response) => response.json());

  }

  /**
   * Returns the dietary goals
   */
  getGoal() {
    return new TotoAPI().fetch('/diet/goal').then((response) => response.json());
  }

  /**
   * Posts a new goal
   */
  postGoal(data) {

    return new TotoAPI().fetch('/diet/goal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));
  }

  /**
   * Updates the existing goals
   */
  putGoal(id, data) {

    return new TotoAPI().fetch('/diet/goal/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((response => response.json()));
  }

  /**
   * Add a new food
   */
  postFood(food) {

    return new TotoAPI().fetch('/diet/foods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(food)
    }).then((response => response.json()));
  }

  /**
   * Update the specified food
   */
  putFood(id, food) {

    return new TotoAPI().fetch('/diet/foods/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(food)
    }).then((response => response.json()));
  }

  /**
   * Delete a food
   */
  deleteFood(foodId) {
    return new TotoAPI().fetch('/diet/foods/' + foodId, {method: 'DELETE'});
  }

}
