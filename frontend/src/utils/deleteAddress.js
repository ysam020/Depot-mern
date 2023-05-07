export async function deleteAddress(email, address) {
  try {
    const response = await fetch(`http://localhost:9002/${email}/address`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(address),
    });

    if (response.status === 200) {
      console.log("Address deleted");
    }
  } catch (error) {
    console.error("Error deleting address:", error);
  }
}
