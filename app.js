import {productsData} from "./products.js";
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backdrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-cofirm");
const productDOM = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");
let cart = [];
let buttonsDOM = [];
// 1. get products

class Products{
  // get from api end point
  getProducts(){
    return productsData;
  }
}

// 2. display products

class UI {
  displayProducts(products){
    let result = "";
    products.forEach(item => {
      result += ` <section class="product">
      <div class="img-container">
          <img src=${item.imageUrl} alt=${item.title}>
      </div>
      <div class="product-desc">
          <p class="product-title">${item.title}</p>
          <p class="product-price">${item.price.toLocaleString()}</p>
      </div>
      <button class="add-to-cart" data-id=${item.id}>
       add to cart
      </button>
      </section>`
  productDOM.innerHTML=result;
    });
  }
  getAddToCartBtns(){
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns;
    const buttons = [...addToCartBtns];
    // console.log(buttons); //convert Node List to Array
    addToCartBtns.forEach(btn=>{
      const id = btn.dataset.id; // get id of btns
      //check if this products id is in cart or not!
      const isInCart = cart.find(P=>P.id ===parseInt(id));
      if (isInCart) {
        btn.innerHTML = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click",(event)=>{
        event.target.innerText ="In Cart";
        event.target.disabled = true;
        // get product from products:
        const addedProduct = {...storage.getProduct(id),quantity:1};
        // add products to cart:
        cart = [...cart,{...addedProduct}];// spread
        // save cart to local storage:
        storage.saveCart(cart);
        // update cart value
        this.setCartValue(cart);
        // add to cart item (Modal)
        this.addCartItem(addedProduct);
        // get cart from storage
      })
    })
  }
  setCartValue(cart){
    // 1. cart Items
    // 2. cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc,curr) =>{
      tempCartItems += curr.quantity;
      return acc + curr.price * curr.quantity;
    },0);
    cartItems.innerText = tempCartItems;
    cartTotal.innerText = `Total price : ${totalPrice.toLocaleString()} $`;

  }
  addCartItem(cartItem){
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${cartItem.imageUrl} alt="Rio" class=${cartItem.title}>
    <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>${cartItem.price.toLocaleString()} $</h5>
    </div>
    <div class="cart-item-controller">
        <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
    </div>
    <i class="fas fa-trash remove-item" data-id=${cartItem.id}></i>`;
    cartContent.appendChild(div);
  }
  setUpApp(){
    // get cart from storage:
    cart = storage.getcart()||[];
    // add cart item
    cart.forEach((cartItem)=> this.addCartItem(cartItem));
    // set Values : price + items
    this.setCartValue(cart);
  }
  cartLogic(){
    //clear cart
    clearCart.addEventListener("click",()=>this.clearCart());

    // cart functionality:
    cartContent.addEventListener("click",(event)=>{
      // console.log(event.target);
      if (event.target.classList.contains("fa-chevron-up")) {
        // console.log(event.target.dataset.id)
        const addQuantity = event.target;
        // 1. get item from cart:
        const addedItem = cart.find((cItem)=> cItem.id == addQuantity.dataset.id);
        addedItem.quantity++;
        // 2. update cart values:
        this.setCartValue(cart);
        // 3. save cart to storage:
        storage.saveCart(cart);
        // 4. update quantity of cart item in ui:
        // console.log(addQuantity.nextElementSibling);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      }else if (event.target.classList.contains("fa-trash")) {
        const removeItem = event.target;
        const _removeItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removeItem.id);
        storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      }else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const substractedItem = cart.find((cItem)=> cItem.id == subQuantity.dataset.id);
        if (substractedItem.quantity ==1) {
          this.removeItem(substractedItem.id);
        cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantity--;
        this.setCartValue(cart);
        storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearCart(){
      cart.forEach((cItem) =>this.removeItem(cItem.id));
      // remove cart content children:
      while (cartContent.children.length) {
        cartContent.removeChild(cartContent.children[0]);
      }
      closeModalFunction();
  }
  removeItem(id){
    // update cart
    cart = cart.filter((cItem)=>cItem.id !== id);
    // update total price and cart items:
    this.setCartValue(cart);
    // update local storage:
    storage.saveCart(cart);
    // get add to cart btns => update text an disabled
    this.getSingleButtonId(id); 
  }
  getSingleButtonId(id){
    const button = buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
    button.innerText = 'add to cart';
    button.disabled = false;
  }
}

//3. storage

class storage{
  static saveProducts(products){
    localStorage.setItem("products",JSON.stringify(products));
  }
  static getProduct(id){
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(p => p.id === parseInt(id));
  }
  static saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart));
  }
  static getcart(){
    return JSON.parse(localStorage.getItem("cart"));
  }
}
// 4. initialize

document.addEventListener("DOMContentLoaded",()=>{
  const products = new Products();
  const productsData = products.getProducts();
  // set up : get cart and set up App
  const ui = new UI();
  ui.setUpApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
  storage.saveProducts(productsData);
});



function showModalFunction() {
  backdrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "30px";
};

function closeModalFunction() {
  backdrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-30%";
};

cartBtn.addEventListener("click",showModalFunction);
closeModal.addEventListener("click",closeModalFunction);
backdrop.addEventListener("click",closeModalFunction);