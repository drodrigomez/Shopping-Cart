const id = document.getElementById.bind(document);
const log = console.log;
const er = console.error;
const cards = id("cards");
const items = id("items");
const footer = id("footer");
const cardTemplete = id("template-card").content;
const footerTemplete = id("template-footer").content;
const shoppingCartTemplete = id("template-carrito").content;
const fragment = document.createDocumentFragment();
let shoppingCart = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if (localStorage.getItem("shoppingCart")) {
        shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"))
        drawShoppingCart();
    }
});

cards.addEventListener("click", e => {
    if (e.target.classList.contains("btn")) {
        setShoppingCart(e.target.parentElement);
    }
    e.stopPropagation();
});

items.addEventListener("click", e => {
    //increment action
    if (e.target.classList.contains("btn-info")) {
        const product = shoppingCart[e.target.dataset.id];
        product.amount++;
        shoppingCart[e.target.dataset.id] = { ...product };
        drawShoppingCart();
    }
    if (e.target.classList.contains("btn-danger")) {
        const product = shoppingCart[e.target.dataset.id];
        product.amount--;
        if (product.amount === 0) {
            delete shoppingCart[e.target.dataset.id];
        }
        drawShoppingCart();
    }
    e.stopPropagation();
})

const fetchData = async () => {
    try {
        const ans = await fetch('data.json');
        const data = await ans.json();
        drawCards(data)
    } catch (error) {
        er(error);
    }
}

const drawCards = data => {
    data.forEach(product => {
        cardTemplete.querySelector("h5").textContent = product.title;
        cardTemplete.querySelector("p").textContent = product.precio;
        cardTemplete.querySelector("img").setAttribute("src", product.thumbnailUrl);
        cardTemplete.querySelector(".btn").dataset.id = product.id;
        const clone = cardTemplete.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
}

const setShoppingCart = object => {
    const product = {
        id: object.querySelector(".btn").dataset.id,
        title: object.querySelector("h5").textContent,
        price: object.querySelector("p").textContent,
        amount: 1
    }
    if (shoppingCart.hasOwnProperty(product.id)) {
        product.amount = shoppingCart[product.id].amount + 1;
    }
    shoppingCart[product.id] = { ...product };
    drawShoppingCart();
}

const drawShoppingCart = () => {
    items.innerHTML = "";
    Object.values(shoppingCart).forEach(product => {
        shoppingCartTemplete.querySelector("th").textContent = product.id;
        shoppingCartTemplete.querySelectorAll("td")[0].textContent = product.title;
        shoppingCartTemplete.querySelectorAll("td")[1].textContent = product.amount;
        shoppingCartTemplete.querySelector(".btn-info").dataset.id = product.id
        shoppingCartTemplete.querySelector(".btn-danger").dataset.id = product.id;
        shoppingCartTemplete.querySelector("span").textContent = product.amount * product.price;
        const clone = shoppingCartTemplete.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);
    drawFooter();
    localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart))
}

const drawFooter = () => {
    footer.innerHTML = "";
    if (Object.keys(shoppingCart).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
        return
    }
    const nAmount = Object.values(shoppingCart).reduce((counter, { amount }) => counter + amount, 0);
    const nPrice = Object.values(shoppingCart).reduce((counter, { amount, price }) => counter + amount * price, 0);
    footerTemplete.querySelectorAll("td")[0].textContent = nAmount;
    footerTemplete.querySelector("span").textContent = nPrice;
    const clone = footerTemplete.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const buttonClear = id("vaciar-carrito");
    buttonClear.addEventListener("click", () => {
        shoppingCart = {};
        drawShoppingCart();
    })
}