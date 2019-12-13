// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';
/*Global state of the app
 - Search object
 - Current recipes object
 - Shopping list object
 - Liked recipes
  */
const state = {};
window.state = state; 

/* 
SEARCH CONTROLLER
*/

//Below is a fn that handles the action after the submit was pushed. Fn called in addEventlistner. 
const controlSearch = async () => {
    //1) get the query from the view. Read the input from the input field. 
    const query = searchView.getInput();
    
    if(query) {
        // 2) Create a new search ojbect that contains that query and add to the state. state.search is a new obj.
        state.search = new Search(query);

        // 3) Prepare UI for results.
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
        // 4) Search for recipes. Below returns a promise. 
        await state.search.getResults(); 

        // 5)  render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Somethin wrong with the search...');
            clearLoader(); 
        } 
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

//closest method returnd the closest ancestor of the current element which matches the selector given in parameter. 
elements.searchResPages.addEventListener('click', e => {
 const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        //10 means base 10 vs 2 which would be binary 
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/* 
RECIPE CONTROLLER #lecture 148
*/
//below is getting the recipe #id
const controlRecipe = async () => {
    ///Get ID from the url 
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        //Create a new recipe object. All data is saved in the state. 
        state.recipe = new Recipe(id);

        try {
        //Get recipe data and parse ingredients. getRecipe will return a promise that is why we use a await
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        //Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcSerivings();
        //Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe);
        //console.log(state.recipe);
        } catch(err) {
            alert('Error processing recipe!');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
/*
LIST CONTROLLER
*/

const controlList = () => {
    //creat a new list if there is none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item); 
    });
}

//Handle delte and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    }
});

// Handling recipe button clicks 
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngrdients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngrdients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
    
});

window.l = new List();