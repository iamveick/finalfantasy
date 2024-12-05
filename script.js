const apiKey = '49bc5f14bd294890bdb44a42ff8a222f'; // Replace with your Spoonacular API key
let dailyCalories = 0;
let dailyDeficit = 0;
let mealSuggestions = [];
let targetWeightLoss = 0;
let daysToGoal = 0;
let weightLossData = [];  // Array to store weight loss goals

// Function to calculate daily caloric needs
function calculateCalories() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const isMale = document.querySelector('input[name="gender"]:checked');

//if - comparison operator
// || - logical operator
// branching if statements with else conditions are used in multiple places

    if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0 || !isMale) {
        document.getElementById('calorieResult').innerHTML = 'Please enter valid weight, height, age, and select a gender.';
        return;
    }

    const bmr = isMale.value === 'male' 
        ? (10 * weight + 6.25 * height - 5 * age + 5) 
        : (10 * weight + 6.25 * height - 5 * age - 161);
    
    dailyCalories = Math.round(bmr * 1.2); // Sedentary activity level

    document.getElementById('calorieResult').innerHTML = `Daily Caloric Needs: ${dailyCalories} calories`; //dom 1
}

// Function to compare daily caloric intake with the calculated needs
function compareCalories() {
    const desiredCalories = parseFloat(document.getElementById('dailyCalorieIntake').value);

    if (isNaN(dailyCalories) || isNaN(desiredCalories)) {
        document.getElementById('calorieComparison').innerHTML = 'Please calculate daily calories first.';
        return;
    }

    dailyDeficit = dailyCalories - desiredCalories;
    document.getElementById('calorieComparison').innerHTML = `Daily Deficit: ${dailyDeficit} calories`; //dom 2
}

// one function which return value is used as the argument 
function saveWeightLossGoal() {
    const goalWeight = parseFloat(document.getElementById('goalWeight').value);

    if (isNaN(goalWeight) || goalWeight <= 0) {
        alert("Please enter a valid goal weight.");
        return;
    }

    // Calculate the total calories to burn to lose the target weight
    const caloriesToLose = goalWeight * 7700; // 1 kg = 7700 calories
    daysToGoal = caloriesToLose / dailyDeficit; // Number of days required to reach the goal

    // Object - Save the goal weight and time to the array
    weightLossData.push({ goal: goalWeight, dailyDeficit: dailyDeficit, caloriesToLose, daysToGoal });
    //Allow the user to create instances of at least one type of resource, object, or document

    displayGoals();
}

// argument displayGoals - to display weight loss goals
function displayGoals() 
//Allow the user to see all created resources, objects, or documents.
{
    const goalList = document.getElementById('weightLossGoalList');
    goalList.innerHTML = '<h3>Saved Goals:</h3>';
    
    weightLossData.forEach((goal, index) => {
        goalList.innerHTML += `
            <div>
                <p><strong>Target Weight Loss:</strong> ${goal.goal} kg</p>
                <p><strong>Time to Goal:</strong> ${Math.ceil(goal.daysToGoal)} days</p>
                <p><strong>Calories to Burn:</strong> ${goal.caloriesToLose} calories</p>
                <p><strong>Explanation:</strong> To lose ${goal.goal} kg, you need to burn a total of ${goal.caloriesToLose} calories. Based on your current daily caloric deficit of ${goal.dailyDeficit} calories, it will take you approximately ${Math.ceil(goal.daysToGoal)} days to reach your goal.</p>
                <button onclick="editGoal(${index})">Edit</button>
                <button onclick="deleteGoal(${index})">Delete</button>
            </div>
        `;
    });
}

// Function call to calculate the number of days to reach the weight loss goal
function calculateDaysToGoal(goalWeight, dailyDeficit) {
    const caloriesToLose = goalWeight * 7700; // 1 kg = 7700 calories
    return caloriesToLose / dailyDeficit;
}

// Allow the user to edit instances of at least one type of resource, object, or document.
function editGoal(index) {
    const goal = weightLossData[index];
    document.getElementById('goalWeight').value = goal.goal;
    weightLossData.splice(index, 1);  // Remove the goal from the array before editing
    displayGoals();
}

// Allow the user to delete instances of at least one type of resource, object, or document.
function deleteGoal(index) {
    weightLossData.splice(index, 1); // Remove the goal from the array
    displayGoals();  // Update the list
}

// Function call to fetch meal suggestions from Spoonacular API using AJAX (GET request)
function fetchMealSuggestions() {
    const inputCalories = parseFloat(document.getElementById('dailyCalorieIntake').value);  // User's desired total daily calories
    const numMeals = parseInt(document.getElementById('numMeals').value);  // Number of meals the user wants

    if (isNaN(inputCalories) || inputCalories <= 0 || isNaN(numMeals) || numMeals <= 0) {
        document.getElementById('mealSuggestions').innerHTML = 'Please enter valid daily calorie intake and number of meals.';
        return;
    }

    // Calculate calories per meal
    const caloriesPerMeal = Math.round(inputCalories / numMeals);  // Desired daily intake divided by the number of meals
    const tolerance = 0.1;  // Allow ±10% range for meal calories

    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?maxCalories=${caloriesPerMeal * (1 + tolerance)}&minCalories=${caloriesPerMeal * (1 - tolerance)}&number=${numMeals}&apiKey=${apiKey}&addRecipeInformation=true`;
//GET Request 

    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl, true); // Display the ability to perform at least one asynchronous call. 
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText); //Display the ability to fetch data from a JSON resource.
            if (data.results && data.results.length > 0) {
                mealSuggestions = data.results;
                let suggestionsHtml = `<h3>Meal Suggestions (${numMeals} Meals):</h3>`;
                mealSuggestions.forEach(meal => {
                    // forEach loop Fetching the calorie information for each meal, ensuring it exists
                    let caloriesAmount = 'N/A';  // Default to 'N/A' if calories are not found

                    if (meal.nutrition && meal.nutrition.nutrients) {
                        const calorieData = meal.nutrition.nutrients.find(nutrient => nutrient.name === 'Calories');
                        if (calorieData) {
                            caloriesAmount = Math.round(calorieData.amount);  // Round to remove decimals
                        }
                    }

                    // Add recipe link to each meal suggestion
                    suggestionsHtml += `
                        <div>
                            <h4><a href="${meal.sourceUrl}" target="_blank">${meal.title}</a></h4>
                            <img src="${meal.image}" alt="${meal.title}" width="100">
                            <p><strong>Calories:</strong> ${caloriesAmount} kcal</p>
                        </div>
                    `;
                });
                document.getElementById('mealSuggestions').innerHTML = suggestionsHtml;
            } else {
                document.getElementById('mealSuggestions').innerHTML = 'No meal suggestions found.';
            }
        } else if (xhr.readyState === 4) {
            document.getElementById('mealSuggestions').innerHTML = `Error fetching meal suggestions: ${xhr.statusText}`;
        }
    };

    xhr.send();
}





// Function to simulate a POST request and save the weight loss goal
function saveWeightLossGoalPost() {
    const goalWeight = parseFloat(document.getElementById('goalWeight').value);

    if (isNaN(goalWeight) || goalWeight <= 0) {
        alert("Please enter a valid goal weight.");
        return;
    }

    // Prepare data to send in the POST request
    const data = {
        goalWeight: goalWeight,
        caloriesToLose: goalWeight * 7700, // 1 kg = 7700 calories
        targetDate: new Date().toLocaleDateString()
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://jsonplaceholder.typicode.com/posts', true); // POST request
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 201) {
            // Successfully posted the data
            alert('Weight loss goal saved!');
            const response = JSON.parse(xhr.responseText);
            console.log('Response:', response); // View the response in console
        } else if (xhr.readyState === 4) {
            alert('Error saving goal');
        }
    };

    // Send the data as a JSON string
    xhr.send(JSON.stringify(data));
}


// Function call to generate final summary with all the details
function generateFinalSummary() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const goalWeight = parseFloat(document.getElementById('goalWeight').value);

    if (isNaN(weight) || isNaN(height) || isNaN(age) || isNaN(goalWeight)) {
        alert('Please fill in all fields before generating the summary.');
        return;
    }

    // Calculate daily caloric needs (BMR calculation based on gender)
    const isMale = document.querySelector('input[name="gender"]:checked');
    const bmr = isMale.value === 'male' 
        ? (10 * weight + 6.25 * height - 5 * age + 5) 
        : (10 * weight + 6.25 * height - 5 * age - 161);
    const dailyCalories = Math.round(bmr * 1.2); // Sedentary activity level

    // Calculate weight loss goal details
    const totalCaloriesToBurn = goalWeight * 7700;
    const daysToGoal = totalCaloriesToBurn / dailyDeficit;

    // BMI Calculation
    const heightInMeters = height / 100;  // Convert height to meters
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);  // BMI formula (rounded to 1 decimal places)

    // Construct the summary message
    let summaryHtml = `<h2>Final Summary</h2>
        <p><strong>Weight:</strong> ${weight} kg</p>
        <p><strong>Height:</strong> ${height} cm</p>
        <p><strong>BMI:</strong> ${bmi}</p>
        <p><strong>Age:</strong> ${age} years</p>
        <p><strong>Goal Weight Loss:</strong> ${goalWeight} kg</p>
        <p><strong>Daily Caloric Needs:</strong> ${dailyCalories} kcal</p>
        <p><strong>Calories to Burn for Goal:</strong> ${totalCaloriesToBurn} kcal</p>
        <p><strong>Estimated Time to Reach Goal:</strong> ${Math.ceil(daysToGoal)} days</p>
        <h3>Meal Suggestions:</h3>`;

    // Add meal suggestions to the summary
    if (mealSuggestions.length > 0) {
        mealSuggestions.forEach(meal => {
            // forEach loop Fetching the calorie information for each meal, ensuring it exists
            let caloriesAmount = 'N/A';  // Default to 'N/A' if calories are not found

            if (meal.nutrition && meal.nutrition.nutrients) {
                const calorieData = meal.nutrition.nutrients.find(nutrient => nutrient.name === 'Calories');
                if (calorieData) {
                    caloriesAmount = Math.round(calorieData.amount);  // Round to remove decimals
                }
            }

            // Add recipe link to each meal suggestion in the summary
            summaryHtml += `
                <div>
                    <h4><a href="${meal.sourceUrl}" target="_blank">${meal.title}</a></h4>
                    <img src="${meal.image}" alt="${meal.title}" width="100">
                    <p><strong>Calories:</strong> ${caloriesAmount} kcal</p>
                </div>
            `;
        });
    } else {
        summaryHtml += '<p>No meal suggestions found.</p>';
    }

    document.getElementById('finalSummary').innerHTML = summaryHtml;
}