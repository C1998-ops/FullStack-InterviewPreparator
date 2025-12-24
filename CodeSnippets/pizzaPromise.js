const bookMyPizza = async () => {
    try {
        const toppings = "moyenese";
        const orderPizza = await orderPizzawithToppings(toppings);
        const payForIt = await payMoney(500);
        console.log("Pizza ordered successfully:", orderPizza, payForIt);
    } catch (error) {
        console.error("Error:", error);
    }
};

const payMoney = async (amount) => { return new Promise((resolve) => resolve(`Amount paid: ${amount}`)) };

const orderPizzawithToppings = (toppings) => {
    return (new Promise((resolve, reject) =>
        toppings === "moyenese"
            ? resolve(`Pizza is available with ${toppings}`)
            : reject(`Currently not available with ${toppings}`)

    ));
}
bookMyPizza();
