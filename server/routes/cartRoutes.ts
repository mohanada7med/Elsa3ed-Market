import { Router, Response } from 'express';
import { requireBuyer, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../services/cartService.ts';

const router = Router();

// Strictly enforce buyer-only role on all cart endpoints
router.use(requireBuyer);

// GET /api/cart - Get user's cart
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { couponCode, governorate } = req.query;

    const cart = await getCart(
      buyerId,
      couponCode ? String(couponCode) : undefined,
      governorate ? String(governorate) : undefined
    );

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب سلة المشتريات',
      code: 'SERVER_ERROR'
    });
  }
});

// Common handler for adding items to cart
const addItemHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId, quantity = 1, selectedColor, customNote } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'معرف المنتج مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0 || !Number.isInteger(parsedQty)) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة يجب أن تكون رقماً صحيحاً موجباً',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedCart = await addToCart(
      buyerId,
      productId,
      parsedQty,
      selectedColor,
      customNote
    );

    res.json({
      success: true,
      message: 'تمت إضافة القطعة التراثية إلى سلة المشتريات',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إضافة المنتج للسلة',
      code: 'CART_ERROR'
    });
  }
};

// POST /api/cart/items & POST /api/cart - Add item to cart
router.post('/items', addItemHandler);
router.post('/', addItemHandler);

// PUT /api/cart/items/:productId - Update item quantity
router.put('/items/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة غير صحيحة',
        code: 'VALIDATION_ERROR'
      });
    }

    const parsedQty = Math.floor(Number(quantity));
    if (parsedQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة يجب ألا تكون سالبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedCart = await updateCartItemQuantity(buyerId, productId, parsedQty);

    res.json({
      success: true,
      message: parsedQty === 0 ? 'تم حذف المنتج من السلة' : 'تم تحديث كمية المنتج في السلة',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث الكمية',
      code: 'CART_ERROR'
    });
  }
});

// PATCH /api/cart/items/:productId
router.patch('/items/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة غير صحيحة',
        code: 'VALIDATION_ERROR'
      });
    }

    const parsedQty = Math.floor(Number(quantity));
    if (parsedQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة يجب ألا تكون سالبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedCart = await updateCartItemQuantity(buyerId, productId, parsedQty);

    res.json({
      success: true,
      message: parsedQty === 0 ? 'تم حذف المنتج من السلة' : 'تم تحديث كمية المنتج في السلة',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error patching cart item:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث الكمية',
      code: 'CART_ERROR'
    });
  }
});

// PUT & PATCH /api/cart - Bulk or single body update
const bulkOrBodyUpdateHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'معرف المنتج والكمية مطلوبان للتحديث',
        code: 'VALIDATION_ERROR'
      });
    }

    const parsedQty = Math.floor(Number(quantity));
    if (parsedQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'الكمية المطلوبة يجب ألا تكون سالبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedCart = await updateCartItemQuantity(buyerId, productId, parsedQty);

    res.json({
      success: true,
      message: parsedQty === 0 ? 'تم حذف المنتج من السلة' : 'تم تحديث كمية المنتج في السلة',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث السلة',
      code: 'CART_ERROR'
    });
  }
};
router.put('/', bulkOrBodyUpdateHandler);
router.patch('/', bulkOrBodyUpdateHandler);

// DELETE /api/cart/items/:productId - Remove single item from cart
router.delete('/items/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId } = req.params;

    const updatedCart = await removeCartItem(buyerId, productId);

    res.json({
      success: true,
      message: 'تم حذف المنتج من سلة المشتريات',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'تعذر حذف المنتج من السلة',
      code: 'SERVER_ERROR'
    });
  }
});

// DELETE /api/cart - Empty the cart
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const updatedCart = await clearCart(buyerId);

    res.json({
      success: true,
      message: 'تم إفراغ سلة المشتريات بنجاح',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'تعذر إفراغ السلة',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
