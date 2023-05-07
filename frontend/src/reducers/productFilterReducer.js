export default function productFilterReducer(state = [], action) {
  switch (action.type) {
    case "MENS_CLOTHING":
      return [...state, action.payload];

    case "WOMENS_CLOTHING":
      return state.filter((element) => element.id !== action.payload.id);

    case "ELECTRONICS":
      console.warn("check state", state);
      return [action.payload];

    case "JEWELERY":
      return [action.payload];

    default:
      return state;
  }
}
