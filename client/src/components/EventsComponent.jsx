function Events({ addresses }) {
  console.log("in event");
  console.log(addresses);
  return (
    <div>
      {addresses.map((address) => (
        <p>{address.returnValues[0]}</p>
      ))}
    </div>
  );
}

export default Events;
