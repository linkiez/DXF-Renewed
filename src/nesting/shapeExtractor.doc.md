# Shape extractor

`extractShapes` converts supported closed DXF entities into nestable shapes.
The returned `shapeEntities` map preserves the source entity for each emitted
shape, including when unsupported entities or holes change the result order.
