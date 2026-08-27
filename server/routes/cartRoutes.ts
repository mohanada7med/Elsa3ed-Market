import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../services/cartService.ts';

const router = Router();

// Apply requireAuth for all cart endpoints
router.use(requireAuth);

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

// POST /api/cart/items - Add item to cart
router.post('/items', async (req: AuthenticatedRequest, res: Response) => {
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

    const updatedCart = await addToCart(
      buyerId,
      productId,
      Number(quantity) || 1,
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
});

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

    const updatedCart = await updateCartItemQuantity(buyerId, productId, Number(quantity));

    res.json({
      success: true,
      message: 'تم تحديث كمية المنتج في السلة',
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
