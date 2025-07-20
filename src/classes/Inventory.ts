enum ItemType {
  Health = 'potion-red',
  Mana = 'potion-blue',
  Energy = 'potion-green',
  Lyre = 'lyre',
}

class Item {
  constructor(public name: string, public type: ItemType, public quantity: number, public value: number) {}
}

export {
  Item,
  ItemType,
}
