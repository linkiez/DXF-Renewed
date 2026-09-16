# NestingHelper

`NestingHelper` exposes the Observable nesting flow together with synchronous
accessors for the most recently completed result and generated outputs.

Each subscription starts from cleared helper state. A cancelled or failed
subscription cannot leave a previous result, shape list, or entity mapping
visible through the accessors.
