import { openModal } from "./modal";
import { getConfig } from "../config";

const $mainContainer = document.getElementsByTagName("main")!;
const $redeemContainer = document.getElementById("items")!;

document.addEventListener("DOMContentLoaded", () => {
    renderRedeemButtons().then();
});

export async function renderRedeemButtons() {
    $redeemContainer.innerHTML = `<div class="redeems-content-spinner"><div class="spinner"></div><p>Loading content...</p></div>`;

    const config = await getConfig();
    const redeems = config.redeems;

    $redeemContainer.innerHTML = "";

    if (config.message)
        $mainContainer[0].insertAdjacentHTML("afterbegin", `<div class="alert">${config.message}</div>`);
    else {
        const alerts = document.getElementsByClassName("alert");
        while (alerts.length > 0) alerts[0].remove();
    }

    if (redeems?.length === 0) $redeemContainer.innerHTML = `<div class="redeems-content-spinner"><p>No content is available.</p></div>`;

    for (const redeem of redeems || []) {
        if (redeem.hidden) continue;

        const item = document.createElement("div");
        item.className = "redeemable-item".concat(redeem.disabled ? " redeemable-item-disabled" : "");
        item.onclick = () => !redeem.disabled && openModal(redeem);

        const img = document.createElement("img");
        img.src = redeem.image;
        item.appendChild(img);

        const redeemableDescriptor = document.createElement("div");
        redeemableDescriptor.className = "redeemable-item-descriptor";
        item.appendChild(redeemableDescriptor);

        const priceWrapper = document.createElement("div");
        priceWrapper.className = "redeemable-item-price-wrapper";
        redeemableDescriptor.appendChild(priceWrapper);

        const bitsImage = document.createElement("img");
        bitsImage.src = "img/bits.png";
        priceWrapper.appendChild(bitsImage);

        const price = document.createElement("p");
        price.className = "redeemable-item-price";
        price.textContent = redeem.price.toString();
        priceWrapper.appendChild(price);

        const name = document.createElement("p");
        name.className = "redeemable-item-title";
        name.textContent = redeem.title;
        redeemableDescriptor.appendChild(name);

        $redeemContainer.appendChild(item);
    }
}
