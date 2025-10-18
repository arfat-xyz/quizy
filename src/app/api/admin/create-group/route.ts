// app/api/admin/create-group/route.ts
import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateGroupSchema } from "@/zod-schemas";
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
    const validatedData = CreateGroupSchema.parse(body);
    const { name } = validatedData;

    // Check if group already exists
    const existingGroup = await db.group.findUnique({
      where: {
        name,
      },
    });

    if (existingGroup) {
      return formatErrorResponse("Group with this name already exists", 409);
    }

    // Create the group
    const group = await db.group.create({
      data: {
        name,
      },
    });

    return formatResponse(
      {
        message: "Group created successfully",
        data: group,
      },
      "Group created successfully",
      201,
    );
  } catch (error) {
    console.error("Create group error:", error);
    return routeErrorHandler(error);
  }
}
