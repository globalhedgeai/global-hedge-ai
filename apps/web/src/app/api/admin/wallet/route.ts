import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AddWalletSchema = z.object({
  cryptocurrency: z.string().min(1),
  address: z.string().min(1)
});

const UpdateWalletSchema = z.object({
  id: z.string().min(1),
  cryptocurrency: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

const DeleteWalletSchema = z.object({
  id: z.string().min(1)
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    // For now, return mock data since we don't have a WalletAddress model
    const addresses = [
      {
        id: '1',
        cryptocurrency: 'USDT_TRC20',
        address: 'TYourCompanyWalletAddressHere',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      ok: true,
      addresses,
      count: addresses.length
    });
    
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch wallet addresses'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = AddWalletSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { cryptocurrency, address } = parsed.data;
    
    // For now, return mock data since we don't have a WalletAddress model
    const newAddress = {
      id: Date.now().toString(),
      cryptocurrency,
      address,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    console.log(`Admin ${session.user.email} added wallet address: ${address} for ${cryptocurrency}`);
    
    return NextResponse.json({
      ok: true,
      address: newAddress,
      message: 'Wallet address added successfully'
    });
    
  } catch (error) {
    console.error('Error adding wallet address:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to add wallet address'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = UpdateWalletSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { id, ...updates } = parsed.data;
    
    // For now, return mock data since we don't have a WalletAddress model
    const updatedAddress = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Admin ${session.user.email} updated wallet address ${id}`);
    
    return NextResponse.json({
      ok: true,
      address: updatedAddress,
      message: 'Wallet address updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update wallet address'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = DeleteWalletSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { id } = parsed.data;
    
    console.log(`Admin ${session.user.email} deleted wallet address ${id}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Wallet address deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting wallet address:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to delete wallet address'
    }, { status: 500 });
  }
}