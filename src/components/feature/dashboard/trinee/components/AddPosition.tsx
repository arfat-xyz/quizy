import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PositionSchema } from "@/zod-schemas/admin/position";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const loginUser = await auth();
    if (loginUser?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("You're not authorized for this", 401);
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate the request body against the schema
    const validatedData = PositionSchema.parse(body);
    const { name } = validatedData;

    // Check if position already exists
    const existingPosition = await db.position.findUnique({
      where: {
        name,
      },
    });

    if (existingPosition) {
      return formatErrorResponse("Position with this name already exists", 409);
    }

    // Create the position
    const position = await db.position.create({
      data: {
        name,
      },
    });

    return formatResponse(
      {
        message: "Position created successfully",
        data: position,
      },
      "Position created successfully",
      201,
    );
  } catch (error) {
    console.error("Create position error:", error);
    return routeErrorHandler(error);
  }
}
