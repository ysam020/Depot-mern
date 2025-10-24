// Original file: /Users/sameer/Downloads/Depot-mern/test/packages/proto-defs/src/proto/product.proto


export interface Product {
  'id'?: (number);
  'title'?: (string);
  'price'?: (number | string);
  'short_description'?: (string);
  'description'?: (string);
  'category'?: (string);
  'tags'?: (string)[];
  'sku'?: (string);
  'weight'?: (string);
  'dimensions'?: (string);
  'color'?: (string);
  'material'?: (string);
  'image'?: (string);
  'rating'?: (number | string);
  'qty'?: (number);
}

export interface Product__Output {
  'id': (number);
  'title': (string);
  'price': (number);
  'short_description': (string);
  'description': (string);
  'category': (string);
  'tags': (string)[];
  'sku': (string);
  'weight': (string);
  'dimensions': (string);
  'color': (string);
  'material': (string);
  'image': (string);
  'rating': (number);
  'qty': (number);
}
