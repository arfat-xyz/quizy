import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.log("Get user by id error: ", error);
    return null;
  }
};
export const getUserByEmail = async (email: string) => {
  try {
    const lowerCaseEmail = email.toLowerCase();
    const user = await db.user.findUnique({
      where: {
        email: lowerCaseEmail,
      },
    });

    return user;
  } catch (error) {
    console.log("Error from Get user by email: ", error);
    return null;
  }
};
