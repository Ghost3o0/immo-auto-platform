-- CreateTable PropertyView
CREATE TABLE "property_views" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable VehicleView
CREATE TABLE "vehicle_views" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_views_propertyId_idx" ON "property_views"("propertyId");

-- CreateIndex
CREATE INDEX "property_views_viewedAt_idx" ON "property_views"("viewedAt");

-- CreateIndex
CREATE INDEX "vehicle_views_vehicleId_idx" ON "vehicle_views"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_views_viewedAt_idx" ON "vehicle_views"("viewedAt");

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_views" ADD CONSTRAINT "vehicle_views_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
