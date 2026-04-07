$(document).ready(function () {
    $.ajax({
        url: "products.json",
        method: "GET",
        dataType: "json",
        success: function (products) {
            $("#featured-products").empty();

            $.each(products, function (index, product) {
                const shortText = product.description.length > 80
                    ? product.description.substring(0, 80) + "..."
                    : product.description;

                const card = `
                    <div class="product-card">
                        <div class="product-image-box">
                            <img src="${product.image}" alt="${product.title}">
                        </div>
                        <div class="product-info">
                            <span class="product-category">${product.category}</span>
                            <h3>${product.title}</h3>
                            <p>${shortText}</p>
                            <div class="product-bottom">
                                <span class="price">$${product.price}</span>
                                <button class="quick-view-btn"
                                    data-title="${product.title}"
                                    data-description="${product.description}"
                                    data-rating="${product.rating}"
                                    data-price="${product.price}"
                                    data-image="${product.image}"
                                    data-category="${product.category}">
                                    Quick View
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                $("#featured-products").append(card);
            });
        },
        error: function () {
            $("#featured-products").html(`
                <div class="error-message">
                    Failed to load featured deals. Please try again.
                </div>
            `);
        }
    });

    $(document).on("click", ".quick-view-btn", function () {
        $("#modalTitle").text($(this).data("title"));
        $("#modalDescription").text($(this).data("description"));
        $("#modalRating").text($(this).data("rating"));
        $("#modalPrice").text($(this).data("price"));
        $("#modalImage").attr("src", $(this).data("image"));
        $("#modalCategory").text($(this).data("category"));

        $("#quickViewModal").fadeIn();
        $("body").addClass("modal-open");
    });

    $("#closeModal, #quickViewModal").on("click", function (e) {
        if (e.target.id === "quickViewModal" || e.target.id === "closeModal") {
            $("#quickViewModal").fadeOut();
            $("body").removeClass("modal-open");
        }
    });
});