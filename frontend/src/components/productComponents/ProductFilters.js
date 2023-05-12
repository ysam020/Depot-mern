import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { categories } from "../../assets/data/FilterCategories";

function ProductFilters(props) {
  let displayCategoryLabel = true;
  let displayColorLabel = true;
  let displayMaterialLabel = true;

  return (
    <div className="product-filters">
      <select
        name="productSort"
        id="productSort"
        onChange={(e) => props.setSortCategory(e.target.value)}
      >
        <option value="">Sort by</option>
        <option value="Sort by Price: Low to high">
          Sort by Price: Low to high
        </option>
        <option value="Sort by Price: High to low">
          Sort by Price: High to low
        </option>
        <option value="Sort by Rating">Sort by Rating</option>
      </select>

      <RadioGroup
        aria-labelledby="color-filter"
        name="color-filter"
        value={props.filterCategory}
      >
        {categories.map((option, id) => {
          const { category, value } = option;
          let displayLabel = false;
          if (category === "category" && displayCategoryLabel) {
            displayLabel = true;
            displayCategoryLabel = false;
          } else if (category === "color" && displayColorLabel) {
            displayLabel = true;
            displayColorLabel = false;
          } else if (category === "material" && displayMaterialLabel) {
            displayLabel = true;
            displayMaterialLabel = false;
          }

          return (
            <div key={id}>
              {displayLabel && (
                <div>
                  <br />
                  <FormLabel>
                    {category === "category"
                      ? "Category"
                      : category === "color"
                      ? "Color"
                      : "Material"}
                  </FormLabel>
                </div>
              )}
              <FormControlLabel
                key={id}
                value={value}
                control={<Radio color="default" size="small" />}
                label={value}
                onChange={(e) => props.setFilterCategory(e.target.value)}
              />
            </div>
          );
        })}
      </RadioGroup>

      <button onClick={() => props.setFilterCategory("")}>Clear filters</button>
    </div>
  );
}

export default ProductFilters;
